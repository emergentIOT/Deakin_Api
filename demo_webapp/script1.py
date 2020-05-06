from flask import Flask, request, render_template
from bs4 import BeautifulSoup

#from __future__ import absolute_import
#from __future__ import division
#from __future__ import print_function
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


app=Flask(__name__)

@app.route('/')
def home():
    #return "Homepage here!!! How are you??"
    return render_template("home1.html")

@app.route('/', methods=['POST'])
def home_post():
    text = request.form['context']
    answer_token = request.form['ans_tok']

    #update answer into html file
    with open('templates/home1.html', 'r') as file_1:
        soup = BeautifulSoup(file_1, features='lxml')

    
    with open('../src/data/qg/test/exp1_data_test.pa.tok.txt','w') as test_file:
        test_file.write(text + ' [SEP]' + ' ' + answer_token + '\n')

    #execute the question generation code
    exec(open('../src/biunilm/decode_seq2seq_raj.py').read())

    with open('../src/fine_tuned_models/qg_model/qg_model.bin.test','r') as question_file:
        soup.label.string = question_file.readline()
        soup.textarea.string = text 
        with open('templates/home1.html', 'w') as file_1:
            file_1.write(soup.prettify())

    return render_template("home1.html")
    #return processed_text

#@app.route('/about/')
#def about():
#    return render_template("about.html")

if __name__=="__main__":
    app.run(host='0.0.0.0', port=8888, debug=True)
#    app.run(port=5000, debug=True)

