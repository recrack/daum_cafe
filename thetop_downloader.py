#!/usr/bin/python
# -*- coding: utf8 -*-

__program__ = u"더탑 클럽앨범 다운로더"
__version__ = u"0.2"
__author__  = u"김장환 janghwan@gmail.com"

"""
    다음 카페 '더탑' 클럽앨범 이미지 다운로더
    
"""
import sys
import os
import re
import datetime

import htmlentitydefs
import urllib, urllib2, httplib, socket
import urlparse
import cookielib

import getpass
from collections import namedtuple, defaultdict

from contextlib import contextmanager 

CAFE_START_PAGE = 'http://cafe.daum.net/'
LOGIN_URL = "https://logins.daum.net/accounts/login.do"

# http://cafe986.daum.net/_c21_/album_list?grpid=ccJT&fldid=_album&page=2&prev_page=1&firstbbsdepth=0014zzzzzzzzzzzzzzzzzzzzzzzzzz&lastbbsdepth=0014kzzzzzzzzzzzzzzzzzzzzzzzzz&albumtype=article&listnum=30
CLUB_ALBUM_URL = 'http://cafe986.daum.net/_c21_/album_list?grpid=ccJT&fldid=_album'
CLUB_ALBUM_URL_TEMPLATE = 'http://cafe986.daum.net/_c21_/album_list?grpid=ccJT&fldid=_album&page=%(page)d&prev_page=%(prev_page)d&listnum=%(listnum)d&firstbbsdepth=%(firstbbsdepth)s&lastbbsdepth=%(lastbbsdepth)s'

# globals
fs_encoding = sys.getfilesystemencoding()


ARTICLE_TIMEOUTS  = [15,30,60]
DOWNLOAD_TIMEOUTS = [30,60,60,120,300]

#logfile=open('log', 'w')
#def log_elapsed(f):
#    import time
#    def decorate(*args, **kwargs):
#        start_time = time.time()
#        result = f(*args, **kwargs)
#        end_time = time.time()
#
#        # write log
#        func_name = "%s(%s, %s)" % (f.__name__, ', '.join(map(repr, args)), ', '.join(x+'='+repr(y) for x,y in kwargs.items()))
#        logfile.write("%s: %d seconds\n" % (func_name, end_time - start_time))
#
#        return result
#    return decorate



#def retry_on_timeout(timeouts):
#    ''' decorator function wrapping a function and let it retry on timeouts
#
#    @retry_on_timeout([30,60,120])
#    def urlread(url):
#        pass
#
#    urlread = retry_on_timeout([30,60,120])(urlread)
#    urlread(url)
#    '''
#    def wrapper(target_func):
#        ''' return a function that runs target_func several times on timeout '''
#        def runner(*args, **kwargs):
#            ''' runner that actualy runs the target_func several times '''
#            for timeout in timeouts:
#                # try..
#                try:
#                    return target_func(*args, **kwargs)
#                # timeout error!
#                except (IOError, httplib.HTTPException):
#                    continue
#            # failed after every try
#            else:
#                print "인터넷 연결이 되지 않습니다."
#                raw_input(u"\n[프로그램을 종료합니다]".encode(fs_encoding))
#                sys.exit(110)
#        return runner
#    return wrapper


#@log_elapsed
def urlopen(url, timeouts=None):
    timeouts = timeouts or [300, 300, 300] # default to wait 5 minutes 3 times

    last_exception = None
    for timeout in timeouts:
        try:
            # HERE
            site = urllib2.urlopen(url, timeout=timeout)
            return site
        # timeout occured
        except IOError as e:
            last_exception = e
            continue
        except httplib.HTTPException as e:
            last_exception = e
            continue
    # all retries failed
    else:
        raise last_exception
        #print "인터넷 연결이 되지 않습니다."
        #raw_input(u"\n[프로그램을 종료합니다]".encode(fs_encoding))
        #sys.exit(110)

#@log_elapsed
def urlread(url, timeouts=None):
    ''' open url and read the context, decode it properly using its header '''

    last_exception = None
    for timeout in timeouts:
        try:
            site = urlopen(url, timeouts=[timeout])
            text = site.read()
            encoding = get_encoding_from_header(site.headers)
            return text.decode(encoding)
        # timeout occured
        except IOError as e:
            last_exception = e
            continue
        except httplib.HTTPException as e:
            last_exception = e
            continue
    # all retries failed
    else:
        raise last_exception
        #print "인터넷 연결이 되지 않습니다."
        #raw_input(u"\n[프로그램을 종료합니다]".encode(fs_encoding))
        #sys.exit(110)


#@log_elapsed
def urlretrieve(url, response, timeouts=None):
    ''' download to temp file. mostly copied from urllib.py '''
    timeouts = timeouts or [300, 300, 300] # default to wait 5 minutes 3 times
    last_exception = None

    # tmp filename
    import tempfile
    path   = urlparse.urlsplit(url).path
    suffix = os.path.splitext(path)[1]
    (fd, tmp_filename) = tempfile.mkstemp(suffix)

    # write
    headers = response.headers.dict
    tmpfile = os.fdopen(fd, 'wb')
    try:
        block_size = 1024*8
        read       =  0
        size       = -1
        if "content-length" in headers:
            size = int(headers["content-length"])
        while True:

            for timeout in timeouts:
                # download block
                try:
                    block = response.read(block_size)
                    break
                # timeout
                except IOError as e:
                    last_exception = e
                    continue
                except httplib.HTTPException as e:
                    last_exception = e
                    continue
            # all retries failed
            else:
                raise last_exception


            if block == "":
                break
            read += len(block)
            tmpfile.write(block)
    finally:
        tmpfile.close()
    if size >= 0 and read < size:
        raise urllib.ContentTooShortError("retrieval incomplete: got only %i out of %i bytes" \
                                           % (read, size), (tmp_filename, headers))

    return tmp_filename



def get_encoding_from_header(header=None, url=None):
    ''' either header or url must be provided '''
    if header is None:
        site = urlopen(url, timeouts=ARTICLE_TIMEOUTS)
        header = site.headers
    ct = header.dict['content-type'].strip()
    param = ct.split(';', 1)[1].strip()
    encoding = param.partition('charset=')[2]
    return encoding

def get_filename_from_header(header=None, url=None):
    ''' either header or url must be provided '''
    if header is None:
        site = urlopen(url, timeouts=ARTICLE_TIMEOUTS)
        header = site.headers
    try:
        cd = header.dict['content-disposition'].strip()
        param = cd.split(';', 1)[1].strip()
        filename = param.partition('filename=')[2].strip('"')
        return filename
    except:
        raise Exception("parse error")

def is_logged_in(text=None):
    if text is None:
        LOGIN_TEST_URL = CAFE_START_PAGE
        try:
            text = urlread(LOGIN_TEST_URL, timeouts=ARTICLE_TIMEOUTS)
        except urllib2.URLError, e:
            sys.stderr.write(str(e))
            sys.stderr.write("\n")
            return

    LOGIN_MARK1  = re.compile(u'''<h3>[^<]*자주가는 카페[^<]*</h3>''')
    LOGIN_MARK2  = re.compile(u'''<div [^>]*id="loginBox"[^>]*>''')
    LOGOUT_MARK1 = re.compile(u'''<div [^>]*id="needLogin"[^>]*>''')
    LOGOUT_MARK2 = re.compile(u'''<form name="loginform" id="loginForm" method="post" action="https://logins.daum.net/accounts/login.do">''')
    # login!
    if LOGIN_MARK1.search(text) and LOGIN_MARK2.search(text):
        return True
    # logout!
    if LOGOUT_MARK1.search(text) and LOGOUT_MARK2.search(text):
        return False
    # heh?
    sys.stderr.write("obscure state..")
    return
        

def authorize(retry_count=3):
    '''
    <form name="loginform" id="loginForm" method="post" action="https://logins.daum.net/accounts/login.do">
        <input type="hidden" name="url" id="url" value="http://cafe.daum.net" />
        <input type="radio" name="securityLevel" id="securityLevel1" value="1" />
        <input type="radio" name="securityLevel" id="securityLevel2" value="2" />
        <input type="radio" name="securityLevel" id="securityLevel3" value="3" />
        <input type="text" name="id" id="id" maxlength="50" class="empty" value="" title="아이디 입력" tabindex="1" />
        <input type="password" name="pw" id="inputPwd" maxlength="32" class="empty" value="" title="비밀번호 입력" tabindex="2" />
        <input type="checkbox" name="saved_id" id="sid" title="아이디 저장" tabindex="3" /><label for="sid">ID 저장</label>
     </form>
    '''

    for _try_count in range(retry_count):
        username = raw_input(u'Username: ')
        password = getpass.getpass()

        login_data = {
            "url": "http://cafe.daum.net",
            "securityLevel": "2",
            "id": username,
            "pw": password,
        }
        #   
        cj = cookielib.CookieJar()
        opener = urllib2.build_opener(urllib2.HTTPCookieProcessor(cj))
        for timeout in ARTICLE_TIMEOUTS:
            try:
                resp = opener.open(LOGIN_URL, data=urllib.urlencode(login_data))
                html = resp.read().decode(get_encoding_from_header(resp.headers))
                break
            # timeout
            except (IOError, httplib.HTTPException):
                continue
        # every try failed
        else:
            print
            print "인터넷 연결이 되지 않습니다. 문제를 해결한 후에 다시 시도해주세요."
            print
            sys.exit(110)


        # login fail
        if u'<title>Daum 로그인 오류</title>' in html:
            '''
        	<p id="errorMsg">
        		입력하신 아이디 혹은 비밀번호가 일치하지 않습니다.<br />
        		비밀번호는 대/소문자 구분하여 입력하시기 바랍니다.
        	</p>
            '''
            print html                              \
                .partition('<p id="errorMsg">')[-1] \
                .partition('</p>')[0]               \
                .replace('<br />', "\n")
            continue

        del password, login_data
        break
    else:
        print u'도저히 로그인이 안되네요. 다음에 해보시죠.'

    # set default opener
    urllib2.install_opener(opener)

    return username


def list_album_board(url):
    '''
        (category, id, path, title, content, url)
    '''
    # fetch inner url
    parse_result = urlparse.urlparse(url)
    if parse_result.netloc == 'cafe.daum.net':
        inner_url = parse_cafe_inner_url_from_official(url)
    else:
        inner_url = url

    # fetch sidebar url
    sidebar_url = parse_sidebar_menu_url_from_cafe_main(inner_url)

    # fetch board info list
    board_info_list = parse_board_info_from_sidebar(sidebar_url)

    return board_info_list

def parse_cafe_inner_url_from_official(url):
    ''' parse cafe official url and return real url 
    
    '''
    CAFE_HOME_PATTERN = re.compile(u'''
        # get src of frame#down
        <frame [^>]*
            (
                (id="down" [^>]*src="([^"]*)")
                |
                (src="([^"]*)" [^>]*id="down")
            )
        [^>]*>
    ''', re.S | re.X)

    site1 = urlread(url, timeouts=ARTICLE_TIMEOUTS)
    match = CAFE_HOME_PATTERN.search(site1)
    if not match:
        raise Exception("parse error")
    url = match.group(3) or match.group(5)
    return url


def parse_sidebar_menu_url_from_cafe_main(url):
    ''' parse cafe main source and return url for cafe sidebar menu '''
    CAFE_SIDEBAR_PATTERN = re.compile(u'''
        # get src of tag iframe#leftmenu
        <iframe 
            [^>]*
            id="leftmenu" 
            [^>]*
            src="([^"]*)"
            [^>]*
        >
    ''', re.S | re.X)

    text = urlread(url, timeouts=ARTICLE_TIMEOUTS)
    match = CAFE_SIDEBAR_PATTERN.search(text)
    if not match:
        raise Exception("parse error")

    path = match.group(1)
    sidebar_url = get_domain(url, path)
    return sidebar_url


def parse_board_info_from_sidebar(url):
    ''' parse cafe menu source and return list of menu information in tuple:
        (category, id, path, title, content, url)

    url is cafe sidebar menu url

    some of examples are:
            <li class="icon_movie_all "><a id="fldlink_movie_bbs" href="/_c21_/movie_bbs_list?grpid=ccJT" target="_parent" onclick="parent_().caller(this.href);return false;" title="&#46041;&#50689;&#49345; &#48372;&#44592;">동영상 보기</a></li>
            <li class="icon_board "><a id="fldlink_9VHG_286" href="/_c21_/bbs_list?grpid=ccJT&amp;fldid=9VHG" target="_parent" onclick="parent_().caller(this.href);return false;" class="" title="&#54616;&#44256;&#49910;&#51008;&#47568; &#47924;&#49832;&#47568;&#51060;&#46304; &#54624; &#49688; &#51080;&#45716; &#44277;&#44036;&#51077;&#45768;&#45796;">이런말 저런말</a></li>
            <li class="icon_album "><a id="fldlink_6bUe_338" href="/_c21_/album_list?grpid=ccJT&amp;fldid=6bUe" target="_parent" onclick="parent_().caller(this.href);return false;" title="climbing picture &amp; info.">Squamish</a></li>
            <li class="icon_phone "><a id="fldlink__album_624" href="/_c21_/album_list?grpid=ccJT&amp;fldid=_album" target="_parent" onclick="parent_().caller(this.href);return false;" title="&#53364;&#47101;&#50536;&#48276;">클럽앨범</a></li>
            <li class="icon_memo "><a id="fldlink__memo_525" href="/_c21_/memo_list?grpid=ccJT&amp;fldid=_memo" target="_parent" onclick="parent_().caller(this.href);return false;" title="&#51068;&#49345;&#51032; &#49692;&#44036;&#49692;&#44036; &#46496;&#50724;&#47476;&#45716; &#51105;&#45392;&#51060;&#45208;,&#44036;&#45800;&#54620; &#47700;&#49464;&#51648;&#47484; &#51201;&#50612;&#48372;&#49464;&#50836;!!">한 줄 메모장</a><img src="http://i1.daumcdn.net/cafeimg/cf_img2/img_blank2.gif" width="10" height="9" alt="new" class="icon_new" /></li> 
    '''
    _type = namedtuple('BoardInfo', 'category id path title content url'.split())

    BOARD_PATTERN = re.compile(u'''
        <li [^>]*                               # LI
            class="(?P<category>icon_[^"]*)\s*" # class attribute
        >
            \s*
            <a                                  # A
                [^>]*
                id="(?P<id>[^"]*)"              # id attribute
                [^>]*
                href="(?P<path>[^"]*)"          # href attribute
                [^>]*
                title="(?P<title>[^"]*)"        # title attribute
                [^>]*
            >
                (?P<content>[^<]*)              # text node under A
            </a>
            \s*

            (                                   # optional new-post image
                <img[^?]*>
            )?
            \s*
        </li>
    ''', re.X | re.S)

    text = urlread(url, timeouts=ARTICLE_TIMEOUTS)
    result = BOARD_PATTERN.findall(text)
    return [_type(
            t[0].strip(), 
            t[1], 
            unescape(t[2], repeat=True), 
            unescape(t[3], repeat=True), 
            t[4],
            get_domain(url, t[2]),
        ) for t in result]


def parse_cafeapp_ui_info(text):
    ''' parse javascript based info inside text 
    
        <script ...>
        ...
            CAFEAPP.ui = {
                ...
            }
        ...
        </script>
    '''
    cafeapp_ui_dict = {}

    script_start, cafeapp_ui_start = False, False
    for line in text.split("\n"):

        if '<script' in line and '</script>' in line:
            if line.rindex('<script') > line.rindex('</script>'):   script_start = True
            else:                                                   script_start = False
        elif '<script'   in line:     script_start = True
        elif '</script>' in line:   script_start = False

        if script_start:
            if cafeapp_ui_start:
                if '}' in line:
                    cafeapp_ui_start = False
                else:
                    k,v = line.strip().split(':', 1)
                    cafeapp_ui_dict[ k.strip() ] = v.strip().rstrip(',').strip('"')

            if '''CAFEAPP.ui = {''' in line:
                cafeapp_ui_start = True

        else:
            if len(cafeapp_ui_dict) > 0:
                return cafeapp_ui_dict

def parse_article_album_list(url, text=None):
    ''' parse article album list and result list of article information as a tuple:
        (article_num, title, post_date, author, path, url)
    '''
    _type = namedtuple('BriefArticleInfo', 'article_num title post_date author path url'.split())

    ARTICLE_LIST_START_MARK = '''<div class="albumListBox">'''
    ARTICLE_LIST_END_MARK   = '''<!-- end albumListBox -->'''

    # fetch
    if text is None:
        text = urlread(url, timeouts=ARTICLE_TIMEOUTS)

    if not(ARTICLE_LIST_START_MARK in text and ARTICLE_LIST_END_MARK in text):
        raise Exception("parse error")
    text = text[ text.index(ARTICLE_LIST_START_MARK): text.index(ARTICLE_LIST_END_MARK) ]

    ARTICLE_PATTERN = re.compile(u'''
        <li[^>]*>\s*
            <dl>
            .*?
            <dd[ ]class="subject">\s*
                <a[ ][^>]*href="(?P<path>[^"]*)"[^>]*>\s*       # path
                (?P<title>[^<]*)\s*                             # title
                </a>\s*
                .*?
            </dd>\s*
            <dd[ ]class="txt_sub[ ]p11">번호\s*
            <span[ ]class="num">(?P<article_num>[0-9]+)</span>  # article_num
            .*?
            <span[ ]class="num">(?P<post_date>[^<]*)</span>\s*  # post_date
            </dd>
            .*?
            <dd[ ]class="txt_sub[ ]nick[ ]p11">\s*
                <a[^>]*>(?P<author>[^<]*)</a>\s*                # author
            </dd>
            .*?
            </dl>
            .*?
        </li>
    ''', re.X | re.S)

    result = []
    for article in text.split('</li>')[:-1]:
        match = ARTICLE_PATTERN.search(article + '</li>')
        if match:
            # (article_num, title, post_date, author, path)
            d = match.groupdict()
            t = (
                int(d['article_num']), 
                d['title'].strip(), 
                d['post_date'], 
                d['author'].strip(), 
                d['path'],
                get_domain(url, d['path']),
            )
            result.append(_type(*t))

    return result



def parse_article_album_view(url):
    ''' parse article album view and result list of article information as a tuple:
        (title, post_date, author, url, image_list)
    '''
    _type = namedtuple('DetailArticleInfo', 'article_num title post_date author url image_list'.split())

    # inner url
    parse_result = urlparse.urlparse(url)
    if parse_result.netloc == 'cafe.daum.net':
        url = parse_cafe_inner_url_from_official(url)

    # strip article info
    ARTICLE_PATTERN = re.compile(u'''
        <div[ ]id="primaryContent">
            .*
            <div[ ]class="article_subject[ ]line_sub">\s*
                <div[ ]class="subject">
                    .*
                    <span[ ]class="b">(?P<title>[^<]*)</span>\s*            # title
                    .*
                </div>\s*
            </div><!--[ ]end[ ]article_subject[ ]-->\s*
            .*
            <div[ ]class="article_writer">\s*
                <a[^>]*>(?P<author>[^<]*)</a>                               # author
                .*
                <span[ ]class="p11[ ]ls0">(?P<post_date>[^<]*)</span>\s*    # post_date
                <span[ ]class="txt_sub[ ]url">\s*
                    <a[ ][^>]*href="(?P<url>[^"]*)"[^>]*>                   # url
                    .*
                    </a>
                    .*
                </span>\s*
            </div><!--[ ]end[ ]article_writer[ ]-->
            .*
        </div>
    ''', re.X | re.S)

    text = urlread(url, timeouts=ARTICLE_TIMEOUTS)
    match = ARTICLE_PATTERN.search(text)
    if not match:
        raise Exception("parse error")
    article_info = match.groupdict()

    # strip image lists from content
    CONTENT_START_MARK = '''<xmp id="template_xmp" name="template_xmp" style="display:none;">'''
    CONTENT_END_MARK = '''</xmp>'''
    if not (CONTENT_START_MARK in text and CONTENT_END_MARK in text):
        raise Exception("parse error")
    text = text[ text.index(CONTENT_START_MARK): text.index(CONTENT_END_MARK) ]

    IMAGE_SRC_PATTERN = re.compile(u'''<img [^>]*src="([^"]*)"[^>]*/?>''')
    image_list = IMAGE_SRC_PATTERN.findall(text)

    # 
    d = article_info
    return _type(
        get_article_num_from_url(d['url']),
        d['title'].strip(), 
        d['post_date'], 
        d['author'].strip(), 
        d['url'],
        image_list
    )


def get_article_num_from_url(url):
    if not is_cafe_article_view_url(url):
        return None

    # http://cafe.daum.net/loveclimb/9uox/318
    if is_cafe_article_view_official_url(url):
        return int(url.rsplit('/', 1)[-1])
    # http://cafe335.daum.net/_c21_/bbs_read?grpid=TweC&mgrpid=&fldid=AtV9&page=1&prev_page=0&firstbbsdepth=&lastbbsdepth=zzzzzzzzzzzzzzzzzzzzzzzzzzzzzz&contentval=00016zzzzzzzzzzzzzzzzzzzzzzzzz&datanum=68&listnum=20
    elif is_cafe_article_view_inner_url(url):
        query = url.rpartition('?')[-1]
        query_dict = dict(kv.split('=') for kv in query.split('&'))
        return int(query_dict['datanum'])


def is_cafe_main_url(url):
    '''
        http://cafe.daum.net/masa2009
        http://cafe.daum.net/nowjang
        http://cafe.daum.net/loveclimb

    # the good
    >>> is_cafe_main_url('http://cafe.daum.net/masa2009')      \
    ... and is_cafe_main_url('http://cafe.daum.net/nowjang')   \
    ... and is_cafe_main_url('http://cafe.daum.net/loveclimb')
    True

    # the bad
    >>> is_cafe_main_url("http://cafe986.daum.net/loveclimb")  \
    ... or is_cafe_main_url("http://cafe.daum.net/loveclimb/bbs_list")
    False
    '''
    parse_result = urlparse.urlparse(url)
    if parse_result.netloc != "cafe.daum.net":
        return False

    path_list = parse_result.path.lstrip('/').split('/')
    if len(path_list) != 1:
        return False

    return True


def is_cafe_article_list_url(url):
    '''
        http://cafe986.daum.net/_c21_/bbs_list?grpid=ccJT&fldid=FVuB
        http://cafe335.daum.net/_c21_/bbs_list?grpid=TweC&fldid=AtV9
        http://cafe430.daum.net/_c21_/bbs_list?grpid=1JnO3&fldid=8lAR

    # the good
    >>> is_cafe_article_list_url('http://cafe986.daum.net/_c21_/bbs_list?grpid=ccJT&fldid=FVuB')     \
    ... and is_cafe_article_list_url('http://cafe335.daum.net/_c21_/bbs_list?grpid=TweC&fldid=AtV9') \
    ... and is_cafe_article_list_url('http://cafe430.daum.net/_c21_/bbs_list?grpid=1JnO3&fldid=8lAR')
    True

    # the bad
    >>> is_cafe_article_list_url("http://cafeABC.daum.net/_c21_/bbs_list?grpid=ccJT&fldid=FVuB")          \
    ... or is_cafe_article_list_url("http://cafe986.daum.net/_c00_/bbs_list?grpid=ccJT&fldid=FVuB")       \
    ... or is_cafe_article_list_url("http://cafe986.daum.net/_c21_/bbs_view?grpid=ccJT&fldid=FVuB")       \
    ... or is_cafe_article_list_url("http://cafe986.daum.net/_c21_/_list/bbs_list?grpid=ccJT&fldid=FVuB") \
    ... or is_cafe_article_list_url("http://cafe986.daum.net/_c21_/bbs_list")
    False
    '''
    NETLOC_PATTERN = re.compile("^cafe[0-9]+[.]daum[.]net$")

    parse_result = urlparse.urlparse(url)
    if not NETLOC_PATTERN.match(parse_result.netloc):
        return False

    path_list = parse_result.path.lstrip('/').split('/')
    if len(path_list) != 2:
        return False

    if path_list[0] != "_c21_":
        return False

    if not path_list[1].endswith("_list"):
        return False

    params = dict(map(urllib.splitvalue, parse_result.query.split('&')))
    if 'grpid' not in params:
        return False
    
    return True


def is_cafe_article_view_url(url):
    return is_cafe_article_view_official_url(url) \
        or is_cafe_article_view_inner_url(url)

def is_cafe_article_view_official_url(url):
    '''
        http://cafe.daum.net/loveclimb/9uox/318
        http://cafe.daum.net/loveclimb/_album/4089
        http://cafe.daum.net/nowjang/AtV9/72
        http://cafe.daum.net/masa2009/8ktU/276

    # the good
    >>> is_cafe_article_view_official_url('http://cafe.daum.net/loveclimb/9uox/318')        /
    ... and is_cafe_article_view_official_url('http://cafe.daum.net/loveclimb/_album/4089') /
    ... and is_cafe_article_view_official_url('http://cafe.daum.net/nowjang/AtV9/72')       /
    ... and is_cafe_article_view_official_url('http://cafe.daum.net/masa2009/8ktU/276')
    True

    # the bad
    >>> is_cafe_article_view_official_url("http://cafe986.daum.net/loveclimb/abc/123")   /
    ... or is_cafe_article_view_official_url("http://cafe.daum.net/loveclimb/abc/temp/123")
    False
    '''
    parse_result = urlparse.urlparse(url)
    if parse_result.netloc != "cafe.daum.net":
        return False

    path_list = parse_result.path.lstrip('/').split('/')
    if len(path_list) != 3:
        return False

    return True


def is_cafe_article_view_inner_url(url):
    '''
        http://cafe335.daum.net/_c21_/bbs_read?grpid=TweC&mgrpid=&fldid=AtV9&page=1&prev_page=0&firstbbsdepth=&lastbbsdepth=zzzzzzzzzzzzzzzzzzzzzzzzzzzzzz&contentval=00016zzzzzzzzzzzzzzzzzzzzzzzzz&datanum=68&listnum=20
        http://cafe430.daum.net/_c21_/bbs_read?grpid=1JnO3&mgrpid=&fldid=8ktU&page=1&prev_page=0&firstbbsdepth=&lastbbsdepth=zzzzzzzzzzzzzzzzzzzzzzzzzzzzzz&contentval=0004Ozzzzzzzzzzzzzzzzzzzzzzzzz&datanum=272&listnum=20
        http://cafe986.daum.net/_c21_/movie_bbs_read?grpid=ccJT&fldid=9VHG&page=&prev_page=&firstbbsdepth=&lastbbsdepth=&contentval=000dqzzzzzzzzzzzzzzzzzzzzzzzzz&datanum=2470&edge=&listnum=
        http://cafe986.daum.net/_c21_/album_read?grpid=ccJT&fldid=_album&page=1&prev_page=0&firstbbsdepth=&lastbbsdepth=zzzzzzzzzzzzzzzzzzzzzzzzzzzzzz&contentval=0014Azzzzzzzzzzzzzzzzzzzzzzzzz&datanum=4102&edge=&listnum=15

    # the good
    >>> is_cafe_article_view_inner_url('http://cafe335.daum.net/_c21_/bbs_read?grpid=TweC&mgrpid=&fldid=AtV9&page=1&prev_page=0&firstbbsdepth=&lastbbsdepth=zzzzzzzzzzzzzzzzzzzzzzzzzzzzzz&contentval=00016zzzzzzzzzzzzzzzzzzzzzzzzz&datanum=68&listnum=20')         \
    ... and is_cafe_article_view_inner_url('http://cafe430.daum.net/_c21_/bbs_read?grpid=1JnO3&mgrpid=&fldid=8ktU&page=1&prev_page=0&firstbbsdepth=&lastbbsdepth=zzzzzzzzzzzzzzzzzzzzzzzzzzzzzz&contentval=0004Ozzzzzzzzzzzzzzzzzzzzzzzzz&datanum=272&listnum=20')   \
    ... and is_cafe_article_view_inner_url('http://cafe986.daum.net/_c21_/movie_bbs_read?grpid=ccJT&fldid=9VHG&page=&prev_page=&firstbbsdepth=&lastbbsdepth=&contentval=000dqzzzzzzzzzzzzzzzzzzzzzzzzz&datanum=2470&edge=&listnum=')                                 \
    ... and is_cafe_article_view_inner_url('http://cafe986.daum.net/_c21_/album_read?grpid=ccJT&fldid=_album&page=1&prev_page=0&firstbbsdepth=&lastbbsdepth=zzzzzzzzzzzzzzzzzzzzzzzzzzzzzz&contentval=0014Azzzzzzzzzzzzzzzzzzzzzzzzz&datanum=4102&edge=&listnum=15')
    True

    # the bad
    >>> is_cafe_article_view_inner_url("http://cafeABC.daum.net/_c21_/bbs_read?grpid=ccJT&fldid=FVuB")          \
    ... or is_cafe_article_view_inner_url("http://cafe986.daum.net/_c00_/bbs_read?grpid=ccJT&fldid=FVuB")       \
    ... or is_cafe_article_view_inner_url("http://cafe986.daum.net/_c21_/bbs_list?grpid=ccJT&fldid=FVuB")       \
    ... or is_cafe_article_view_inner_url("http://cafe986.daum.net/_c21_/_read/bbs_read?grpid=ccJT&fldid=FVuB")
    False
    '''
    NETLOC_PATTERN = re.compile("^cafe[0-9]+[.]daum[.]net$")

    parse_result = urlparse.urlparse(url)
    if not NETLOC_PATTERN.match(parse_result.netloc):
        return False

    path_list = parse_result.path.lstrip('/').split('/')
    if len(path_list) != 2:
        return False

    if path_list[0] != "_c21_":
        return False

    if not path_list[1].endswith("_read"):
        return False

    params = dict(map(urllib.splitvalue, parse_result.query.split('&')))
    if 'grpid' not in params:
        return False
    
    return True



def download_image_and_move_to_dest(url, save_directory):
    ''' 
        1. fetch meta (header)
        2. download content and save to temp file
        3. move temp file
    '''
    # fetch meta
    #timeouts = (30,60,120)
    #for timeout in timeouts: 
    #    try:
    #        response = urllib2.urlopen(url, timeout=timeout)
    #        break
    #    # timeout!
    #    except IOError:
    #        continue
    #else:
    #    print "인터넷 연결이 되지 않습니다."
    #    raw_input(u"\n[프로그램을 종료합니다]".encode(fs_encoding))
    #    sys.exit(110)
    try:
        response = urlopen(url, timeouts=DOWNLOAD_TIMEOUTS)
    except (IOError, httplib.HTTPException):
        print
        print "인터넷 연결이 원활하지 않아 다운로드가 완료되지 못했습니다."
        print
        return False

    filename = get_filename_from_header(response.headers)
    filename = unescape(filename)
    print filename, u"...", 
    sys.stdout.flush()

    # download to temp
    try:
        tmp_filename = urlretrieve(url, response, timeouts=DOWNLOAD_TIMEOUTS)

        # move
        result_filepath = os.path.join(save_directory, filename)
        if os.path.exists(result_filepath) and sys.platform.startswith('win32'):
            os.remove(result_filepath)

        os.rename(tmp_filename, result_filepath)
    except (IOError, httplib.HTTPException):
        print
        print "인터넷 연결이 원활하지 않아 다운로드가 완료되지 못했습니다."
        print
        if 'tmp_filename' in locals() and os.path.exists(tmp_filename):
            os.unlink(tmp_filename)
        return False
    except Exception as e:
        if 'tmp_filename' in locals() and os.path.exists(tmp_filename):
            os.unlink(tmp_filename)
        return False

    return True


#
# util
#
def get_domain(url, path=None):
    '''
        urlparse:
            <scheme>://<netloc>/<path>;<params>?<query>#<fragment>
    '''
    parse_result = urlparse.urlparse(url)
    domain = '''%(scheme)s://%(netloc)s''' % parse_result._asdict()
    domain = domain.rstrip('/')

    # paste path if any
    if path:
        return domain + "/" + unescape(path).lstrip('/')

    return domain


def unescape(text, repeat=None):
    ''' from http://effbot.org/zone/re-sub.htm#unescape-html '''
    def fixup(m):
        text = m.group(0)
        if text[:2] == "&#":
            # character reference
            try:
                if text[:3] == "&#x":
                    return unichr(int(text[3:-1], 16))
                else:
                    return unichr(int(text[2:-1]))
            except ValueError:
                pass
        else:
            # named entity
            try:
                text = unichr(htmlentitydefs.name2codepoint[text[1:-1]])
            except KeyError:
                pass
        return text # leave as is
    new_text = re.sub("&#?\w+;", fixup, text)

    # once
    if repeat is None:
        return new_text

    # repeat for specified times, until no change
    repeat_count = 0
    while new_text != text:
        text = new_text
        new_text = re.sub("&#?\w+;", fixup, text)

        repeat_count += 1
        if repeat is True: 
            continue
        elif repeat_count >= repeat:
            break

    return new_text

def is_hangul(u):
    return u'가' <= u <= u'힣' or u'ㄱ' <= u <= u'ㅎ'

def is_fullwidth(u):
    ''' from FULLWIDTH EXCLAMATION MARK(\uff01) to FULLWIDTH RIGHT WHITE PARENTHESIS(\uff60) '''
    return u'\uff01' <= u <= u'\uff60'

def count_hangul(u):
    return sum(is_hangul(x) for x in u)

def count_fullwidth(u):
    return sum(is_fullwidth(x) for x in u)

def print_length(title):
    ''' return width of string if printed on console '''
    return len(title) + count_hangul(title) + count_fullwidth(title)

def safe_dirname(dirname):
    ''' return safe directory under Windows, replacing special characters '''
    invalid_characters = r'\/:*?"<>|'
    for invalid in invalid_characters:
        dirname = dirname.replace(invalid, '_')
    return dirname



#
# application
#

def intro():
    print u"%s v%s (만든이 %s)" % (__program__, str(__version__), __author__)

def print_help():
    print u'''[도움말]

<페이지 이동>
  다음 페이지를 보고 싶으면 n을, 
  이전 페이지를 보고 싶으면 p를 입력하세요.
  
<선택>
  한번에 다운로드 받고 싶은 번호들을 모두 선택해주세요.
  예)
   “판교외벽 사진을 한번에 받고 싶다” --> '4147-4143'
   “톱쟁이가 올린 사진을 받고 싶다”   --> '4141, 4140, 4151'
   “우중산행?”                        --> '4153'
   “드록바 빼고 전부 다”              --> '4153,4151-4138'
  
  선택된 번호를 보고 싶으면 s를 누르면 됩니다.
  
<다운로드>
  엔터를 입력하면 다운로드가 진행됩니다.
'''
    raw_input(u"[엔터를 누르세요] ".encode(fs_encoding))
    print

def rcut(u, cut_length, suffix=None):
    ''' right cut given unicode to given cut_length, where cut_length is measured in console print '''
    if print_length(u) <= cut_length:
        return u
    index = 0
    while True:
        length_so_far = print_length(u[:index])
        if   length_so_far  > cut_length: return u[:index-1] if suffix is None else u[:index-1-len(suffix)] + suffix
        elif length_so_far == cut_length: return u[:index]   if suffix is None else u[:index-1-len(suffix)] + suffix
        index += 1

def format_article(article, selected, max_width=79):
    ''' 
    _2_ 4?        _2_ 15      _3_ ?      2?        _5_  _10_
        article_num)  post_date | title [image_count]         - author
        4152) 2011.06.21 03:57 | 암벽교실 16기 6월 19일 [8]   - 드록바
    '''
    post_date   = article.post_date.replace('. ', ' ')
    post_date   = post_date.rpartition('%s.' % datetime.datetime.today().strftime("%Y"))[-1]
    author      = rcut(article.author, 10)
    image_count = len(article.image_list)
    article_num = article.article_num

    if selected:  selected_str = '*'
    else:         selected_str = ' '

    image_count_part_length = 3 + len(`image_count`) 
    title_length = max_width - 2 - len(`article_num`) - 2 - len(post_date) - 5 - 10
    article_title = rcut(article.title, title_length - image_count_part_length , suffix='..')
    article_title = "%s [%d]" % (article_title, image_count)

    space = ''.ljust(title_length - print_length(article_title))

    s  = u''
    s += u"%s"    % selected_str
    s += u" %d)"  % article_num
    s += u" %s"   % post_date
    s += u" | %s" % article_title
    s += u'%s'    % space
    s += u"- %s"  % author

    return s


def list_page(current_page, articles_iter, selected=[]):
    print u"스포츠클라이밍 실내암벽 더탑 > 클럽앨범 > page %d" % current_page
    articles = []

    for a in articles_iter:
        is_selected = a.url in selected
        print format_article(a, is_selected)
        articles.append(a)
    print
    return articles

def list_selected_articles(current_page, cached_articles, articles, selected):
    '''
    * 4150) 2011.06.19 22:01 | 암벽16기 4차교육_선인봉_2 [19]               - 웅이
    * 4145) 2011.06.18 21:44 | 20110618 판교외벽_3 [17]                     - 웅이
    * 4139) 2011.06.14 01:04 | 20110612 간현암 [8]                          - 웡이
    '''

    if len(selected) == 0:
        print u"선택한 게시물이 없습니다."
    else:
        for a in resolve_selected_articles(current_page, cached_articles, articles, selected):
            if a.url not in selected:
                continue

            print format_article(a, True)

    raw_input(u"[엔터를 누르세요] ".encode(fs_encoding))
    print

def interpret_selection(selection):
    ''' selection may be in form of 

      * '4153'                   => [4153]
      * '4141 4140, 4151'        => [4140, 4141, 4151]
      * '4147-4143'              => range(4143, 4147+1)
      * '4153,4151-4138'         => [4153] + range(4138,4151+1)
      * '4125, 4124 4121 - 4116' => [4125, 4124] + range(4116,4121+1)
    '''

    selections = [s.strip() for s in selection.replace(',', ' ').replace('-', ' - ').split(' ')]
    selections = [s for s in selections if s]

    minmax = lambda a: (min(a), max(a))

    result = []
    i = 0
    while i < len(selections):
        token = selections[i]
        if token == '-':
            #new_val = result.pop() + '-' + selections[i+1]
            first  = int(result.pop())
            second = int(selections[i+1])
            small, large = minmax((first, second))
            result.extend(range(small, large+1))
            #result.append(new_val)
            i += 1
        else:
            result.append(int(token))
        i += 1

    return set(result)


def is_selection_format(s):
    return re.match("[-0-9 ,]+", s) is not None

def resolve_selected_articles(current_page, cached_articles, articles, selected):
    # try with current articles
    selected_articles = [a for a in articles if a.url in selected]

    # still left? search cache
    if len(selected_articles) < len(selected):
        for page, c_articles in cached_articles.iteritems():
            if page == current_page:
                continue
            selected_articles.extend(a for a in c_articles if a.url in selected)

    return selected_articles


def select_articles(selection, current_page, cached_articles, articles, selected):
    for a in articles:
        if a.article_num not in selection:
            continue
        # toggle
        if a.url in selected:   selected.remove(a.url)
        else:                   selected.add(a.url)
        # remove from selection
        selection.remove(a.article_num)

    # still left? search cache
    if len(selection) > 0:
        for page, articles in cached_articles.iteritems():
            if page == current_page:
                continue
            for a in articles:
                if a.article_num not in selection:
                    continue
                # toggle
                if a.url in selected:   selected.remove(a.url)
                else:                   selected.add(a.url)
                # remove from selection
                selection.remove(a.article_num)

    return selected

def get_save_directory():
    if sys.platform.startswith('win32'):
        import winpaths
        base_directory = winpaths.get_desktop()
    else:
        #base_directory = os.path.abspath(os.path.dirname(__file__))
        base_directory = os.path.abspath(os.path.dirname(sys.argv[0])).decode(fs_encoding)

    path_resolved = False
    while not path_resolved:
        print u"저장할 폴더 이름을 정해주세요. 바탕화면 아래에 저장됩니다."
        folder_name = raw_input(u'(예: "간현암 판교외벽 선인봉") > '.encode(fs_encoding)).decode(fs_encoding)
        print
        if folder_name.strip() == u'':
            continue

        fullpath = os.path.normpath(os.path.join(base_directory, folder_name))
        if os.path.exists(fullpath):
            print fullpath, u'아래에 저장합니다.'
            path_resolved = True
        elif os.path.sep in folder_name:
            for i in range(fullpath.count(os.path.sep)):
                subpath = fullpath.rsplit(os.path.sep, i+1)[0]
                if os.path.exists(subpath):
                    new_folder = fullpath.rpartition(subpath)[-1].lstrip(os.path.sep)
                    yn = raw_input((u"%s%s 아래에 '%s' 폴더를 생성하겠습니까? (Y/n) " % (subpath, os.path.sep, new_folder)).encode(fs_encoding)).strip()
                    print
                    if yn.lower() != 'n':
                        os.makedirs(os.path.join(subpath, new_folder))
                        path_resolved = True
                    break

        if not os.path.exists(fullpath):
            os.makedirs(fullpath)
            path_resolved = True

    return fullpath

def download(current_page, cached_articles, articles, selected):
    base_directory = get_save_directory()

    selected_articles = resolve_selected_articles(current_page, cached_articles, articles, selected)
    max_title_length = max(print_length(a.title)    for a in selected_articles)
    max_image_count  = max(len(`len(a.image_list)`) for a in selected_articles)

    total_image_sum = sum(len(a.image_list) for a in selected_articles)
    image_downloaded_so_far = 0

    for i,a in enumerate(selected_articles):
        post_date   = a.post_date.replace('. ', ' ')
        title       = a.title.strip()
        author      = a.author.partition('(')[0]
        image_count = len(a.image_list)
        space = ''.ljust(max_title_length + max_image_count - print_length(title) - len(`image_count`))
        print u"(%d/%d) %d) %s | %s [%d] %s- %s" % (
            i+1, len(selected_articles),
            a.article_num, post_date, title, len(a.image_list), 
            space, author)

        folder_name  = "[%s] %s" % (post_date.partition(' ')[0], title)
        folder_name += " (#%d)" % a.article_num
        folder_name  = safe_dirname(folder_name)
        save_directory = os.path.join(base_directory, folder_name)
        if not os.path.exists(save_directory):
            os.makedirs(save_directory)

        print u'%s' % save_directory
        image_count_width = len(`len(a.image_list)`)
        for j,url in enumerate(a.image_list):
            image_index = `(j+1)`.zfill(image_count_width)
            print u"  [%s/%d]" % (image_index, image_count),

            # download & filename
            url = url.replace('daum.net/image/', 'daum.net/original/')
            success = download_image_and_move_to_dest(url, save_directory)

            # critical failure while downloading.
            if not success:
                print u"%d번째 글 '%s'을 다운로드 받는 도중 문제가 생겼습니다." % (i+1, title)
                print u"이 글을 포함하여 나머지 %d개의 글은 다운로드하지 못했습니다." % (len(selected_articles)-i)
                print u"문제가 해결되고 다시 시도해보세요."
                if i > 0:
                    print u"다운 완료된 글 목록:"
                    for success_article in selected_articles[:i]:
                        print u" * %s: %d 개", (success_article.title.strip(), len(success_article.image_list))
                        selected.remove(success_article)
                else:
                    print u"다운 완료된 글 없음"
                print
                raw_input(u"[엔터를 누르세요] ".encode(fs_encoding))
                return

            print u"ok"

            image_downloaded_so_far += 1

        percent = image_downloaded_so_far * 100 / total_image_sum
        print u"전체 %d개 중 %d개 이미지를 저장 완료했습니다. (%.0f%%)" % (total_image_sum, image_downloaded_so_far, percent)
        print

    # download complete
    print u"다운로드가 완료되었습니다."
    print
    selected.clear()



def user_input(current_page, selected_count):
    # line1
    if current_page > 1:
        print u'이전페이지(p),',
    print u'다음페이지(n), 다시보기(l), 선택(번호),',
    if selected_count:
        print u'선택된번호(s),',
    print u'도움말(h)'

    # line2
    if selected_count:
        print u'현재 선택 %d개. 입력(enter는 다운로드) >' % selected_count,
    else:
        print u'입력(enter는 다운로드) >',
    return raw_input()


def get_album_url(new_page=1, articles_in_page=15, current_cafeapp_ui={}):
    # http://cafe986.daum.net/_c21_/album_list?grpid=ccJT&fldid=_album&page=2&prev_page=1&firstbbsdepth=0014zzzzzzzzzzzzzzzzzzzzzzzzzz&lastbbsdepth=0014kzzzzzzzzzzzzzzzzzzzzzzzzz&albumtype=article&listnum=15
    # http://cafe986.daum.net/_c21_/album_list?grpid=ccJT&fldid=_album&page=2&prev_page=1&listnum=15

    # document.location.href="/_c21_/album_list?grpid="+CAFEAPP.GRPID+"&fldid="+CAFEAPP.FLDID+"&page="+page+"&prev_page="+CAFEAPP.ui.PAGER_page+"&firstbbsdepth="+CAFEAPP.ui.FIRSTBBSDEPTH+"&lastbbsdepth="+CAFEAPP.ui.LASTBBSDEPTH+"&albumtype=article&listnum="+listnum;
    # "prev_page="+CAFEAPP.ui.PAGER_page + "&firstbbsdepth="+CAFEAPP.ui.FIRSTBBSDEPTH+"&lastbbsdepth="+CAFEAPP.ui.LASTBBSDEPTH

    #prev_page = max(new_page - 1, 1)
    if 'FIRSTBBSDEPTH' in current_cafeapp_ui and \
       'PAGER_page'    in current_cafeapp_ui and \
       'LASTBBSDEPTH'  in current_cafeapp_ui:
           return CLUB_ALBUM_URL_TEMPLATE % {
               'page'          : new_page,
               'listnum'       : articles_in_page,
               'prev_page'     : int(current_cafeapp_ui['PAGER_page']),
               'firstbbsdepth' : current_cafeapp_ui['FIRSTBBSDEPTH'],
               'lastbbsdepth'  : current_cafeapp_ui['LASTBBSDEPTH'],
           }
    # return first page
    else:
        return CLUB_ALBUM_URL

def fetching_articles(current_page, articles_in_page, current_cafeapp_ui):
    if current_page < 1:
        current_page = 1

    try:
        album_url = get_album_url(current_page, articles_in_page, current_cafeapp_ui)
        text = urlread(album_url, timeouts=ARTICLE_TIMEOUTS)

        # update cafeapp_ui
        new_cafeapp_ui = parse_cafeapp_ui_info(text)
        if new_cafeapp_ui:
            current_cafeapp_ui.update(new_cafeapp_ui)

        # parse articles
        articles_brief = parse_article_album_list(album_url, text)
        articles_iter  = (parse_article_album_view(a.url) for a in articles_brief)
        return articles_iter

    except (IOError, httplib.HTTPException):
        print u"\n[오류] 인터넷 연결이 되지 않습니다. 문제를 해결한 후에 다시 시도해주세요.\n"
        return None


@contextmanager
def keyboard_interrupt_handler():
    try:
        yield
    except KeyboardInterrupt:
        raw_input(u"\n[프로그램을 종료합니다]".encode(fs_encoding))
        sys.exit(2)
    except:
        print
        print
        print u'어익후!'
        print u'에러가 나서 프로그램이 종료해야 합니다. 미처 고려하지 못한 부분이 있었나보네요.' 
        print u'현상이 반복되면 아래 내용을 복사해서 메일로 보내주세요.'
        print u' ->', __author__ 
        print u'문제를 진단하고 해결하는데 큰 도움이 됩니다.'
        print '-' * 79
        print sys.excepthook(*sys.exc_info())
        raw_input(u"\n[프로그램을 종료합니다]".encode(fs_encoding))
        sys.exit(-1)

if __name__ == '__main__':
    with keyboard_interrupt_handler():
        intro()
        print

        # login
        print u"로그인을 해주세요."
        authorize()
        print


        # settings
        current_page = 1
        articles_in_page = 15
        current_cafeapp_ui = {}
        cached_articles = {}    # { page_no: [articles], }

        #
        articles = fetching_articles(current_page, articles_in_page, current_cafeapp_ui)
        if articles is None:
            raw_input(u"\n[프로그램을 종료합니다]".encode(fs_encoding))
            sys.exit(110)

        selected = set()

        while True:
            articles = list_page(current_page, *(articles, selected))

            # udpate context
            cached_articles[current_page] = articles
            context = (articles, selected)

            # 이전페이지(p), 다음페이지(n), 다시보기(l), 선택된번호(s), 선택(번호), 도움말(h)
            # 현재 선택 3개. 입력(enter는 다운로드) >
            resp = user_input(current_page, len(selected)).strip().lower()
            print

            if resp in ('h', '?'):
                print_help()
            # next / previous
            elif resp in ('p', 'n'):
                if resp == 'p': current_page -= 1
                else:           current_page += 1

                if current_page in cached_articles:
                    articles = cached_articles[current_page]
                else:
                    articles = fetching_articles(current_page, articles_in_page, current_cafeapp_ui)
                    if articles is None:
                        continue
            # reload
            elif resp == 'l':
                # reset settings
                current_page = 1
                articles_in_page = 15
                cached_articles.clear()
                current_cafeapp_ui = {}

                articles = fetching_articles(current_page, articles_in_page, current_cafeapp_ui)
                if articles is None:
                    continue

            # list selected
            elif resp == 's':
                list_selected_articles(current_page, cached_articles, *context)
            # add selection
            elif is_selection_format(resp):
                selection = interpret_selection(resp)
                selected = select_articles(selection, current_page, cached_articles, *context)
            # proceed
            elif resp == '':
                # exit on empty selection
                if len(selected) == 0:
                    yn = raw_input(u"선택한 게시물이 없습니다. 종료하겠습니까? (Y/n) ".encode(fs_encoding)).strip()
                    if yn.lower() != 'n':
                        break
                # download
                else:
                    download(current_page, cached_articles, *context)

        print


# vim: sts=4 et 