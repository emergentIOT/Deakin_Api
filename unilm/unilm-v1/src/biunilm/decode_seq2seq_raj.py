"""BERT finetuning runner."""

from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import os
import logging
import glob
import argparse
import math
from tqdm import tqdm, trange
import numpy as np
import torch
from torch.utils.data import DataLoader, RandomSampler
from torch.utils.data.distributed import DistributedSampler
import random
import pickle


from pytorch_pretrained_bert.tokenization import BertTokenizer, WhitespaceTokenizer
from pytorch_pretrained_bert.modeling import BertForSeq2SeqDecoder
from pytorch_pretrained_bert.optimization import BertAdam, warmup_linear

from nn.data_parallel import DataParallelImbalance
import biunilm.seq2seq_loader as seq2seq_loader


#logging.basicConfig(format='%(asctime)s - %(levelname)s - %(name)s -   %(message)s',
#                    datefmt='%m/%d/%Y %H:%M:%S',
#                    level=logging.INFO)
#logger = logging.getLogger(__name__)


def detokenize(tk_list):
    r_list = []
    for tk in tk_list:
        if tk.startswith('##') and len(r_list) > 0:
            r_list[-1] = r_list[-1] + tk[2:]
        else:
            r_list.append(tk)
    return r_list


def ascii_print(text):
    text = text.encode("ascii", "ignore")
    print(text)


def main():

    def detokenize(tk_list):
        r_list = []
        for tk in tk_list:
            if tk.startswith('##') and len(r_list) > 0:
                r_list[-1] = r_list[-1] + tk[2:]
            else:
                r_list.append(tk)
        return r_list

    def ascii_print(text):
        text = text.encode("ascii", "ignore")
        print(text)

    logging.basicConfig(format='%(asctime)s - %(levelname)s - %(name)s -   %(message)s',
                        datefmt='%m/%d/%Y %H:%M:%S',
                        level=logging.INFO)
    logger = logging.getLogger(__name__)
#    parser = argparse.ArgumentParser()

    # Required parameters
#    parser.add_argument("--bert_model", default="bert-large-cased", type=str, required=True,
#                        help="Bert pre-trained model selected in the list: bert-base-uncased, "
#                             "bert-large-uncased, bert-base-cased, bert-base-multilingual, bert-base-chinese.")
    bert_model = "bert-large-cased"
#    parser.add_argument("--model_recover_path", default="../src/fine_tuned_models/qg_model/qg_model.bin", type=str,
#                        help="The file of fine-tuned pretraining model.")
    model_recover_path = "/home/joel/workspace-ai/ai-api/data/unilm/fine_tuned_models/qg_model/qg_model.bin"
#    parser.add_argument("--max_seq_length", default=512, type=int,
#                        help="The maximum total input sequence length after WordPiece tokenization. \n"
#                             "Sequences longer than this will be truncated, and sequences shorter \n"
#                             "than this will be padded.")
    max_seq_length = 512
#    parser.add_argument('--ffn_type', default=0, type=int,
#                        help="0: default mlp; 1: W((Wx+b) elem_prod x);")
    ffn_type = 0
#    parser.add_argument('--num_qkv', default=0, type=int,
#                        help="Number of different <Q,K,V>.")
    num_qkv = 0
#    parser.add_argument('--seg_emb', action='store_true',
#                        help="Using segment embedding for self-attention.")
    seg_emb = False

    # decoding parameters
#    parser.add_argument('--fp16', action='store_true',
#                        help="Whether to use 16-bit float precision instead of 32-bit")
    fp16 = False
#    parser.add_argument('--amp', action='store_true',
#                        help="Whether to use amp for fp16")
    amp = False
#    parser.add_argument("--input_file", default="../src/data/qg/test/exp1_data_test.pa.tok.txt", type=str, help="Input file")
    input_file = "/home/joel/workspace-ai/ai-api/data/unilm/qg/test/exp1_data_test.pa.tok.txt"
#    parser.add_argument('--subset', type=int, default=0,
#                        help="Decode a subset of the input dataset.")
    subset = 0
#    parser.add_argument("--output_file", type=str, help="output file")
    output_file = None
#    parser.add_argument("--split", type=str, default="test",
#                        help="Data split (train/val/test).")
    split = "test"
#    parser.add_argument('--tokenized_input', action='store_true',
#                        help="Whether the input is tokenized.")
    tokenized_input = False
#    parser.add_argument('--seed', type=int, default=123,
#                        help="random seed for initialization")
    seed = 123
#    parser.add_argument("--do_lower_case", action='store_true',
#                        help="Set this flag if you are using an uncased model.")
    do_lower_case = False
#    parser.add_argument('--new_segment_ids', action='store_true',
#                        help="Use new segment ids for bi-uni-directional LM.")
    new_segment_ids = True
#    parser.add_argument('--new_pos_ids', action='store_true',
#                        help="Use new position ids for LMs.")
    new_pos_ids = False
#    parser.add_argument('--batch_size', type=int, default=4,
#                        help="Batch size for decoding.")
    batch_size = 16
#    parser.add_argument('--beam_size', type=int, default=1,
#                        help="Beam size for searching")
    beam_size = 1
#    parser.add_argument('--length_penalty', type=float, default=0,
#                        help="Length penalty for beam search")
    length_penalty = 0

#    parser.add_argument('--forbid_duplicate_ngrams', action='store_true')
    forbid_duplicate_ngrams = False
#    parser.add_argument('--forbid_ignore_word', type=str, default=None,
#                        help="Ignore the word during forbid_duplicate_ngrams")
    forbid_ignore_word = None
#    parser.add_argument("--min_len", default=None, type=int)
    min_len = None
#    parser.add_argument('--need_score_traces', action='store_true')
    need_score_traces = False
#    parser.add_argument('--ngram_size', type=int, default=3)
    ngram_size = 3
#    parser.add_argument('--mode', default="s2s",
#                        choices=["s2s", "l2r", "both"])
    mode = "s2s"
#    parser.add_argument('--max_tgt_length', type=int, default=128,
#                        help="maximum length of target sequence")
    max_tgt_length = 48
#    parser.add_argument('--s2s_special_token', action='store_true',
#                        help="New special tokens ([S2S_SEP]/[S2S_CLS]) of S2S.")
    s2s_special_token = False
#    parser.add_argument('--s2s_add_segment', action='store_true',
#                        help="Additional segmental for the encoder of S2S.")
    s2s_add_segment = False
#    parser.add_argument('--s2s_share_segment', action='store_true',
#                        help="Sharing segment embeddings for the encoder of S2S (used with --s2s_add_segment).")
    s2s_share_segment = False
#    parser.add_argument('--pos_shift', action='store_true',
#                        help="Using position shift for fine-tuning.")
    pos_shift = False
#    parser.add_argument('--not_predict_token', type=str, default=None,
#                        help="Do not predict the tokens during decoding.")
    not_predict_token = None

#    args = parser.parse_args()

    if need_score_traces and beam_size <= 1:
        raise ValueError(
            "Score trace is only available for beam search with beam size > 1.")
    if max_tgt_length >= max_seq_length - 2:
        raise ValueError("Maximum tgt length exceeds max seq length - 2.")

    device = torch.device(
        "cuda" if torch.cuda.is_available() else "cpu")
    n_gpu = torch.cuda.device_count()

    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if n_gpu > 0:
        torch.cuda.manual_seed_all(seed)

    tokenizer = BertTokenizer.from_pretrained(
        bert_model, do_lower_case=do_lower_case)

    tokenizer.max_len = max_seq_length

    pair_num_relation = 0
    bi_uni_pipeline = []
    bi_uni_pipeline.append(seq2seq_loader.Preprocess4Seq2seqDecoder(list(tokenizer.vocab.keys()), tokenizer.convert_tokens_to_ids, max_seq_length, max_tgt_length=max_tgt_length, new_segment_ids=new_segment_ids,
                                                                    mode="s2s", num_qkv=num_qkv, s2s_special_token=s2s_special_token, s2s_add_segment=s2s_add_segment, s2s_share_segment=s2s_share_segment, pos_shift=pos_shift))

    amp_handle = None
    if fp16 and amp:
        from apex import amp
        amp_handle = amp.init(enable_caching=True)
        logger.info("enable fp16 with amp")

    # Prepare model
    cls_num_labels = 2
    type_vocab_size = 6 + \
        (1 if s2s_add_segment else 0) if new_segment_ids else 2
    mask_word_id, eos_word_ids, sos_word_id = tokenizer.convert_tokens_to_ids(
        ["[MASK]", "[SEP]", "[S2S_SOS]"])

    def _get_token_id_set(s):
        r = None
        if s:
            w_list = []
            for w in s.split('|'):
                if w.startswith('[') and w.endswith(']'):
                    w_list.append(w.upper())
                else:
                    w_list.append(w)
            r = set(tokenizer.convert_tokens_to_ids(w_list))
        return r

    forbid_ignore_set = _get_token_id_set(forbid_ignore_word)
    not_predict_set = _get_token_id_set(not_predict_token)
    print(model_recover_path)

    for model_recover_path in glob.glob(model_recover_path.strip()):
        logger.info("***** Recover model: %s *****", model_recover_path)
        model_recover = torch.load(model_recover_path)
        model = BertForSeq2SeqDecoder.from_pretrained(bert_model, state_dict=model_recover, num_labels=cls_num_labels, num_rel=pair_num_relation, type_vocab_size=type_vocab_size, task_idx=3, mask_word_id=mask_word_id, search_beam_size=beam_size,
                                                      length_penalty=length_penalty, eos_id=eos_word_ids, sos_id=sos_word_id, forbid_duplicate_ngrams=forbid_duplicate_ngrams, forbid_ignore_set=forbid_ignore_set, not_predict_set=not_predict_set, ngram_size=ngram_size, min_len=min_len, mode=mode, max_position_embeddings=max_seq_length, ffn_type=ffn_type, num_qkv=num_qkv, seg_emb=seg_emb, pos_shift=pos_shift)
        del model_recover

        if fp16:
            model.half()
        model.to(device)
        if n_gpu > 1:
            model = torch.nn.DataParallel(model)

        torch.cuda.empty_cache()
        model.eval()
        next_i = 0
        max_src_length = max_seq_length - 2 - max_tgt_length

        with open(input_file, encoding="utf-8") as fin:
            input_lines = [x.strip() for x in fin.readlines()]
            if subset > 0:
                logger.info("Decoding subset: %d", subset)
                input_lines = input_lines[:subset]
        data_tokenizer = WhitespaceTokenizer() if tokenized_input else tokenizer
        input_lines = [data_tokenizer.tokenize(
            x)[:max_src_length] for x in input_lines]
        input_lines = sorted(list(enumerate(input_lines)),
                             key=lambda x: -len(x[1]))
        output_lines = [""] * len(input_lines)
        score_trace_list = [None] * len(input_lines)
        total_batch = math.ceil(len(input_lines) / batch_size)

        with tqdm(total=total_batch) as pbar:
            while next_i < len(input_lines):
                _chunk = input_lines[next_i:next_i + batch_size]
                buf_id = [x[0] for x in _chunk]
                buf = [x[1] for x in _chunk]
                next_i += batch_size
                max_a_len = max([len(x) for x in buf])
                instances = []
                for instance in [(x, max_a_len) for x in buf]:
                    for proc in bi_uni_pipeline:
                        instances.append(proc(instance))
                with torch.no_grad():
                    batch = seq2seq_loader.batch_list_to_batch_tensors(
                        instances)
                    batch = [
                        t.to(device) if t is not None else None for t in batch]
                    input_ids, token_type_ids, position_ids, input_mask, mask_qkv, task_idx = batch
                    traces = model(input_ids, token_type_ids,
                                   position_ids, input_mask, task_idx=task_idx, mask_qkv=mask_qkv)
                    #print(traces)
                    if beam_size > 1:
                        traces = {k: v.tolist() for k, v in traces.items()}
                        output_ids = traces['pred_seq']
                        #print(output_ids)
                        #print(traces)
                    else:
                        output_ids = traces.tolist()
                        #print(traces)
                        #print(output_ids)

                    for i in range(len(buf)):
                        w_ids = output_ids[i]
                        output_buf = tokenizer.convert_ids_to_tokens(w_ids)
                        output_tokens = []
                        for t in output_buf:
                            if t in ("[SEP]", "[PAD]"):
                                break
                            output_tokens.append(t)
                        output_sequence = ' '.join(detokenize(output_tokens))
                        output_lines[buf_id[i]] = output_sequence
                        if need_score_traces:
                            score_trace_list[buf_id[i]] = {
                                'scores': traces['scores'][i], 'wids': traces['wids'][i], 'ptrs': traces['ptrs'][i]}
                        print("hi")
                pbar.update(1)
        if output_file:
            fn_out = output_file
        else:
            fn_out = model_recover_path+'.'+split
        with open(fn_out, "w", encoding="utf-8") as fout:
            for l in output_lines:
                fout.write(l)
                fout.write("\n")

        if need_score_traces:
            with open(fn_out + ".trace.pickle", "wb") as fout_trace:
                pickle.dump(
                    {"version": 0.0, "num_samples": len(input_lines)}, fout_trace)
                for x in score_trace_list:
                    pickle.dump(x, fout_trace)


if __name__ == "__main__":
    main()
