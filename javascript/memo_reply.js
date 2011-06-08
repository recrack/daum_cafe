/**
 * @namespace ���ٰԽ���, ����� ���� ���� namespace
 */
Memo = {};

/**
 * ���ٰԽ���, ����� �Է� ������ ��� �Դϴ�.
 * <pre>
 * options.mode		: ������ ��� (���Ȱ�)  "memo" | "reply"
 * options.buttontype	: ������ ���� ��ưŸ��  "write" | "reply" | "modify" | "confirm"
 * options.onsubmit	: �۵�� �� ȣ��� �ݹ��Լ�
 * options.oncancel	: ��� �� ȣ��� �ݹ��Լ�
 * </pre>
 * @constructor
 * @class �Է� ������
 * @param {String} targetId		������ ���� ��� ������Ʈ ID (�ʼ�)
 * @param {Object} options		������ �ɼ� (�ʼ�)
 *
 * @property {String} editorId		������ ID
 * @property {Element} $form		������ ������Ʈ
 * @property {String} mode			������ ���
 * @property {String} buttontype	���� ��ư Ÿ��
 * @property {Boolean} isOpen		[�������] �մԴ�� ����
 * @property {String} content		�Էµ� �� ����
 * @property {String} imageUrl		÷�� �̹��� ���
 * @property {String} imageName		÷�� �̹��� ���� ���ϸ�
 * @property {Number} imageSize		÷�� �̹��� ũ��
 * @property {Boolean} isHidden		��б� ����
 * @property {Boolean} isTexticon	�ؽ�Ƽ�� ��� ����
 * @property {Boolean} isNotice		������ ����
 * @property {Boolean} fontProperties.bold	���� - ���� �β���
 * @property {String} fontProperties.color	���� - ���� ����
 */
Memo.Editor = function(targetId, options) {
	// basic
	this.editorId = targetId;
	this.$form = $E(this.editorId);
	this.timeoutId = null;
	this.LIMIT_BYTES = 300;
	this.isOpen = false;
	this.mode = "memo";		// "memo" | "reply"
	this.buttontype = "write";	// "write" | "reply" | "modify" | "confirm"
	// options
	for (var i in options) this[i] = options[i];
	// data
	this.content = "";
	this.imageUrl = null;
	this.imageName = null;
	this.imageSize = null;
	this.isHidden = false;
	this.isTexticon = false;
	this.isNotice = false;
	this.fontProperties = {
		bold: false,
		color: ""
	}
	// initialize
	this.initControl();
	this.initEvent();
	this.initLayerManager();
	if (!this.hiddenForm) {
		this.initImageUploader();
	}
	this.checkWriteStatus();
}

Memo.Editor.prototype = {
	/**
	 * ��Ʈ�� ���ú� �ʱ�ȭ
	 * @private
	 */
	initControl: function() {
		try {
			this.$textCounter		= Sizzle(".text_counter", this.$form)[0];
			this.$textarea		= Sizzle("textarea", this.$form)[0];
			this.$submit			= Sizzle("a.submit_content", this.$form)[0];
			this.$submit_sub		= Sizzle("a.submit_content_sub", this.$form)[0];
			this.$cancel			= Sizzle("a.cancel_content", this.$form)[0];
			this.$previewArea		= Sizzle(".preview_area", this.$form)[0];
			this.$uploadViewer	= Sizzle(".upload_viewer", this.$previewArea)[0];
			this.$previewDelete	= Sizzle(".btn_delete", this.$previewArea)[0];
			if (Sizzle(".longtail_editor_menu", this.$form).length > 0) {
				this.$controls		= Sizzle(".longtail_editor_menu", this.$form)[0];
				this.$menuPhoto		= daum.$E(Sizzle(".menu_photo", this.$controls)[0]);
				this.$menuHidden		= daum.$E(Sizzle(".menu_secret", this.$controls)[0]);
				this.$menuSetting		= daum.$E(Sizzle(".menu_setting", this.$controls)[0]);
				this.$menuFontWeight	= Sizzle(".menu_font_weight", this.$controls).length>0 && Sizzle(".menu_font_weight", this.$controls)[0];
				// Color selectbox
				if (Sizzle(".menu_font_color", this.$controls).length > 0) {
					this.$menuFontColor = Sizzle(".menu_font_color", this.$controls)[0];
					this.$menuFontColor.id = "c_picker_"+this.editorId;
					this.$colorPicker = new Memo.Widget.ColorSelectBox(this.$menuFontColor, { 
						isTextColor: true, 
						isAppend: false, 
						callback: this.fontColorChangeHandler.bind(this), 
						onShow: this.fontColorClickHandler.bind(this, this.$menuFontColor),
						parent: this
					});
				}
			}
		} catch(ex) {
			throw "�����Ϳ� �ʼ����� ��Ʈ���� �������� �ʽ��ϴ�.";
		}
		// Set Button Type
		if (this.buttontype != "write") {
			this.changeButtonType(this.buttontype);
		}
	},
	/**
	 * �̺�Ʈ ���ú� �ʱ�ȭ
	 * @private
	 */
	initEvent: function() {
		daum.addEvent(this.$textarea, "focus", this.textareaFocusHandler.bind(this));
		daum.addEvent(this.$textarea, "blur", this.textareaBlurHandler.bind(this));
		daum.addEvent(this.$submit, "click", this.submitHandler.bind(this));
		if (this.$controls) {
			daum.addEvent(this.$controls, "click", this.controlClickHandler.bind(this));
		}
		if (this.$cancel) {
			daum.addEvent(this.$submit_sub, "click", this.submitHandler.bind(this));
			daum.addEvent(this.$cancel, "click", this.cancelHandler.bind(this));
		}
		if (this.$previewDelete) {
			daum.addEvent(this.$previewDelete, "click", this.previewDeleteHandler.bind(this));
		}
		if (this.$colorPicker) {
			daum.addEvent(this.$colorPicker.viewerEl, "mouseover", this.colorPickerMouseHandler.bind(this));
			daum.addEvent(this.$colorPicker.viewerEl, "mouseout", this.colorPickerMouseHandler.bind(this));
		}
	},
	/**
	 * Layer Manager ���� �� �ʱ�ȭ
	 * @private
	 */
	initLayerManager: function() {
		this.$layer_manager = $("longtailLayerManager");
		this.$layer_link = $("longtailLayerLink");
		this.$layer_emoticon = $("emoticonLayer");
		this.$layer_setting = $("longtailLayerSetting");
		
		if (this.$layer_link)		Memo.Layer.Link.init();
		if (this.$layer_emoticon)	Memo.Layer.Emoticon.init();
		if (this.$layer_setting)	Memo.Layer.Setting.init();
		
		// ��ũ ���̾� �Ŵ��� ���
		var $item_link = Sizzle("li.menu_link .menu_item", this.$controls)[0];
		if ($item_link) {
			$item_link.id = "item_link_" + this.editorId;
			Memo.Widget.LayerManager.registLayer($item_link.id, this.$layer_link.id, this.linkClickHandler.bind(this, $item_link.parentNode), Memo.Layer.Link);
			this.$item_link = $item_link;
		}
		// �̸�Ƽ�� ���̾� �Ŵ��� ���
		if (this.$layer_emoticon) {
			var $item_emoticon = Sizzle("li.menu_emoticon .menu_item", this.$controls) && Sizzle("li.menu_emoticon .menu_item", this.$controls)[0];
			if ($item_emoticon) {
				$item_emoticon.id = "item_emoticon_" + this.editorId;
				Memo.Widget.LayerManager.registLayer($item_emoticon.id, this.$layer_emoticon.id, this.emoticonClickHandler.bind(this, $item_emoticon.parentNode), Memo.Layer.Emoticon);
				this.$item_emoticon = $item_emoticon;
			}
		}
		// ���� ���̾� �Ŵ��� ���
		var $item_setting = Sizzle("li.menu_setting .menu_item", this.$controls)[0];
		if ($item_setting) {
			$item_setting.id = "item_setting_" + this.editorId;
			Memo.Widget.LayerManager.registLayer($item_setting.id, this.$layer_setting.id, this.settingClickHandler.bind(this, $item_setting.parentNode), Memo.Layer.Setting);
			this.$item_setting = $item_setting;
		}
	},
	/**
	 * �̹��� ���δ� �ʱ�ȭ
	 * @private
	 */
	initImageUploader: function() {
		if (this.isInitImageUploader || !CAFEAPP || !CAFEAPP.CAFE_ENCRYPT_LOGIN_USERID || CAFEAPP.CAFE_ENCRYPT_LOGIN_USERID == "") return;
		this.$uploader = $C(this.$form, "coca_uploader")[0];
		if (this.$uploader) {
			this.$uploader.id = "uploader_" + this.editorId;
			this.appendCoca(this.$uploader.id, this.imageLoadCompleteHandler.bind(this), this.editorId);
			this.isInitImageUploader = true;
		}
	},
	/**
	 * ������ �۾��� ���� ���� ���� ��Ȳ�� ���� ���� üũ�� ���� �Ѵ�.
	 * @private
	 */
	checkWriteStatus: function() {
		// ���ٸ޸��� �ϴ� 99,999�� �۾��� ���� üũ (������ ����)
		// Ȩ�Խ��� ���ٸ޸��� ����
		if (CAFEAPP && CAFEAPP.ui && CAFEAPP.ui.MEMO_NEWDATA_COUNT && CAFEAPP.ui.MEMO_NEWDATA_COUNT >= 99999 && (this.mode == "memo" && this.buttontype == "write")) {
			this.disable(Memo.Message.MEMO_OVERFLOW);
		}
	},
	/**
	 * ������ �ϴ� ��Ʈ�ѵ��� �Ӽ��� ���� �Ѵ�.
	 * <pre>
	 * Boolean controlObj.isHidden		: ����� ����
	 * Boolean controlObj.isNotice		: ������ ����
	 * Boolean controlObj.isTexticon	: ����� ���� ����
	 * </pre>
	 * @param {Object} controlObj
	 */
	setControlValue: function(controlObj) {
		for (c in controlObj) {
			if (typeof this[c] == "undefined") { return; }
			this[c] = controlObj[c];
			switch(c) {
				case "isHidden" :
					this.changeHiddenView();
					break;
				case "isNotice" :
					this.changeNoticeView();
					break;
				case "isTexticon" :
					this.changeTexticonView();
					break;
			}
		}
	},
	/**
	 * ����� ���� ��ư�� �����Ѵ�.
	 * @private
	 */
	changeHiddenView: function(isSelect) {
		var $item = $E(Sizzle('.menu_secret', this.$form)[0]);
		if ($item) {
			if ( (this.isHidden && typeof isSelect==="undefined") || isSelect) {
				$item.addClassName("menu_secret_select");
			} else {
				$item.removeClassName("menu_secret_select");
			}
		}
	},
	/**
	 * ������ ���� ���θ� �����Ѵ�.
	 * @private
	 */
	changeNoticeView: function() {
		var $item = $E(Sizzle('.menu_notice input', this.$form)[0]);
		if ($item) {
			if (this.isNotice) {
				daum.Element.show(this.$menuFontWeight);
				daum.Element.show(this.$menuFontColor);
			} else {
				daum.Element.hide(this.$menuFontWeight);
				daum.Element.hide(this.$menuFontColor);
			}
			$item.checked = this.isNotice;
		}
	},
	/**
	 * �ؽ�Ƽ�� ���� ���θ� �����Ѵ�.
	 * @private
	 */
	changeTexticonView: function() {
		if (Memo.Layer.Setting.$check_texticon) {
			Memo.Layer.Setting.$check_texticon.checked = this.isTexticon;
		}
	},
	/**
	 * �������� ��Ʈ �Ӽ��� ���� �Ѵ�.
	 * <pre>
	 * Boolean properties.bold	: ��Ʈ �α�
	 * String properties.color	: ��Ʈ ����
	 * </pre>
	 * @param {Object} properties
	 */
	setFontProperties: function(properties) {
		if (typeof properties == "undefined") { return; }
		
		this.fontProperties = properties;
		var $boldButton = $E(Sizzle('.menu_font_weight', this.$form)[0]);
		// set bold button
		if (properties.bold) {
			$boldButton.addClassName("menu_font_weight_select");
		} else {
			$boldButton.removeClassName("menu_font_weight_select");
			Memo.Widget.LayerManager.clear();
		}
		// set color button
		var $colorButton = Sizzle('.menu_font_color', this.$form)[0];
		$colorButton.style.backgroundColor = this.fontProperties.color;
	},
	/** @private */
	submitHandler: function(e) {
		daum.Event.preventDefault(e);
		if (this.disabled) return;
		if (daum.String.trim(this.$textarea.value) == "" || this.$textarea.value == Memo.Message.NO_COMMENTS) {
			alert( "������ �Է��Ͻ� �� ��Ϲ�ư�� �����ּ���." );
			this.$textarea.focus();
			return;
		}
		if (this.onsubmit) {
			this.onsubmit();
		}
	},
	
	/** @private */
	getSelectedSnsNames : function(){
		var snsShareItems = Sizzle("ul.sns_share_items input", this.$controls);
		var selectedSnsNames = [];
		for(var i = 0; i < snsShareItems.length; i++){
			if(snsShareItems[i].checked && !snsShareItems[i].disabled){
				selectedSnsNames.push(snsShareItems[i].className);
			}
		}
		return selectedSnsNames;
	},
	
	/** @private */
	cancelHandler: function(e) {
		daum.Event.preventDefault(e);
		if (this.oncancel) {
			this.oncancel();
		}
	},
	/** @private */
	controlClickHandler: function(e) {
		var $target = $E(daum.Event.getElement(e));
		if (!$target.hasClassName("menu_item")) return;
		if ($target.tagName.toLowerCase()=="a") {
			daum.preventDefault(e);
		}
		var $menu = $E(daum.Element.getParent($target));
		if (!$menu) return;
		var selectMenu = $menu.className;
		if ($menu.hasClassName("menu_link"))				this.linkClickHandler($menu);
		if ($menu.hasClassName("menu_emoticon"))			this.emoticonClickHandler($menu);
		if ($menu.hasClassName("menu_secret"))			this.secretClickHandler($menu);
		if ($menu.hasClassName("menu_notice")) {
			if ($target.tagName.toLowerCase()=="label")  {
				$target = $E($target.getPrev());
				$target.checked = !this.isNotice;
			}
			this.noticeClickHandler($target);
		}
		if ($menu.hasClassName("menu_setting"))			this.settingClickHandler($menu);
		if ($menu.hasClassName("menu_font_weight"))		this.fontWeightClickHandler($menu);
	},
	/** @private */
	linkClickHandler: function($item) {
		$item = $E($item);
		if ($item.hasClassName("menu_link_select")) {
			$item.removeClassName("menu_link_select");
			Memo.Layer.Link.hide();
			Memo.Widget.LayerManager.clear();
		} else {
			$item.addClassName("menu_link_select");
			Memo.Layer.Link.show(this, $item);
		}
	},
	/** @private */
	emoticonClickHandler: function($item) {
		$item = $E($item);
		if ($item.hasClassName("menu_emoticon_select")) {
			$item.removeClassName("menu_emoticon_select");
			Memo.Layer.Emoticon.hide();
			Memo.Widget.LayerManager.clear();
		} else {
			$item.addClassName("menu_emoticon_select");
			Memo.Layer.Emoticon.show(this, $item);
		}
	},
	/** @private */
	secretClickHandler: function($item) {
		$item = $E($item);
		
		
		if (this.isHidden) {
			this.isHidden = false;
			$item.removeClassName("menu_secret_select");
			
			this.enableSns();
		} else {
			this.isHidden = true;
			$item.addClassName("menu_secret_select");
			
			this.disableSns();
		}
	},
	
	resetSns: function(){
		if(this.isHidden){
			this.disableSns();
		} else {
			this.enableSns()
		}
		
		var $sns_share = daum.$$(".sns_share_items", this.$controls)[0];
		if($sns_share){
			var chkSnsShares = daum.$T("input", $sns_share);
			for(var i = 0; i < chkSnsShares.length; i++){
				chkSnsShares[i].checked = false;
			}
		}
		applySnsAllows();
	},
	
	showSns: function(){
		var $sns_share = daum.$$(".sns_share_items", this.$controls)[0];
		if($sns_share){
			daum.Element.show($sns_share);
		}
	},
	hideSns: function(){
		var $sns_share = daum.$$(".sns_share_items", this.$controls)[0];
		if($sns_share){
			daum.Element.hide($sns_share);
		}
	},
	
	enableSns: function(){
		var $sns_share = daum.$$(".sns_share_items", this.$controls)[0];
		if($sns_share){
			daum.Element.removeClassName($sns_share, "disabled");
			var chkSnsShares = daum.$T("input", $sns_share);
			for(var i = 0; i < chkSnsShares.length; i++){
				chkSnsShares[i].disabled = false;
			}
		}
	},
	disableSns: function(){
		var $sns_share = daum.$$(".sns_share_items", this.$controls)[0];
		if($sns_share){
			daum.Element.addClassName($sns_share, "disabled");
			var chkSnsShares = daum.$T("input", $sns_share);
			for(var i = 0; i < chkSnsShares.length; i++){
				chkSnsShares[i].disabled = true;
			}
		}
	},
	
	
	/** @private */
	noticeClickHandler: function($item) {
		if ($item.checked) {
			daum.Element.show(this.$menuFontWeight);
			daum.Element.show(this.$menuFontColor);
		} else {
			daum.Element.hide(this.$menuFontWeight);
			daum.Element.hide(this.$menuFontColor);
		}
		this.isNotice = !!$item.checked;
	},
	/** @private */
	settingClickHandler: function($item) {
		$item = $E($item);
		if(Memo.Layer.Setting.visible()){
			Memo.Layer.Setting.hide();
			Memo.Widget.LayerManager.clear();
		} else {
			Memo.Layer.Setting.show(this, $item);
		}
	},
	/** @private */
	fontWeightClickHandler: function($item) {
		$item = $E($item);

		if (this.fontProperties.bold) {
			this.fontProperties.bold = false;
			$item.removeClassName("menu_font_weight_select");
		} else {
			this.fontProperties.bold = true;
			$item.addClassName("menu_font_weight_select");
		}
	},
	/** @private */
	fontColorClickHandler: function($item) {
		if ($item.hasClassName("menu_font_color_select")) {
			$item.removeClassName("menu_font_color_select");
			Memo.Widget.LayerManager.clear();
		} else {
			$item.addClassName("menu_font_color_select");
		}
	},
	/** @private */
	fontColorChangeHandler: function(color) {
		this.fontProperties.color = color;
	},
	/** @private */
	textareaFocusHandler: function() {
		if (this.timeoutId) return;
		this.$textarea.style.imeMode = "active";
		this.textareaCheckInterval();
	},
	/** @private */
	textareaCheckInterval: function() {
		if (this.checkFlag) return;
		if (this.prevText != this.$textarea.value) {
			this.checkTextBytes();
		}
		if (this.$textarea.value === Memo.Message.NO_COMMENTS) {
			this.setComment("");
		}
		this.timeoutId = setTimeout(this.textareaCheckInterval.bind(this), 100);
		this.prevText = this.$textarea.value;
	},
	/** @private */
	textareaBlurHandler: function() {
		clearTimeout(this.timeoutId);
		this.timeoutId = null;
	},
	/** @private */
	imageLoadCompleteHandler: function(result, ctx) {
		this.setPreviewImage(result);
	},
	/** @private */
	previewDeleteHandler: function() {
		this.imageUrl = null;
		$E(this.$previewArea).hide();
		$E(this.$textarea.parentNode).removeClassName("has_image");
	},
	/** @private */
	colorPickerMouseHandler: function(ev) {
		var $target = daum.Event.getElement(ev);
		var $parent = daum.$E($target).getParent();
		if (ev.type.toLowerCase() == "mouseover") {
			$parent.addClassName("menu_font_color_hover");
		} else if (ev.type.toLowerCase() == "mouseout") {
			$parent.removeClassName("menu_font_color_hover");
		}
	},
	/** @private */
	checkTextBytes: function() {
		var curBytes = this.getTextBytes(this.$textarea.value);
		if (curBytes > this.LIMIT_BYTES) {
			this.checkFlag = true;
			this.$textarea.blur();
			alert("�ִ� " + this.LIMIT_BYTES + "���̹Ƿ� �ʰ��� ���ڼ��� �ڵ����� �����˴ϴ�.");
			if (this.$textCounter) {
				this.$textCounter.innerHTML = this.LIMIT_BYTES;
			}
			this.$textarea.value = this.cutString(this.$textarea.value, this.LIMIT_BYTES*2);
			this.checkFlag = false;
		} else {
			if (this.$textCounter) {
				this.$textCounter.innerHTML = Math.floor(curBytes).toString();
			}
		}
	},
	/** @private */
	getTextBytes: function(value) {
		return daum.String.byteLength(value)/2;
	},
	/** @private */
	cutString : function(s, limit){
		var _limit = limit,
			_byte = 0,
			_str = '',
			val, i;
		for(i=0;i<s.length;i+=1){
			val = escape(s.charAt(i)).length;
			if(val>3){ _byte++; _limit--; }
			_byte++; _limit--;
			if(_limit>=0){_str+=s.charAt(i);}			
		}
		return (limit >= _byte) ? s : _str; 
	},
	/** @private */
	appendCoca: function(targetId, callback, ctx) {
		Coca.callbackList[ctx] = callback;
		var flashvars = {
			coca_service: "CafeReplyCoca",
			coca_ctx: ctx || "",
			service: "cafe",
			sname: "cafe",
			sid: "cafe",
			single_selection: true,
			coca_skin: (this.mode=="reply")?"http://i1.daumcdn.net/cafeimg/cf_img4/bg/edit09_01.gif":"http://i1.daumcdn.net/cafeimg/cf_img4/bg/edit01_01.gif",
			coca_over_skin: (this.mode=="reply")?"http://i1.daumcdn.net/cafeimg/cf_img4/bg/edit09_02.gif":"http://i1.daumcdn.net/cafeimg/cf_img4/bg/edit01_02.gif",
			coca_down_skin: (this.mode=="reply")?"http://i1.daumcdn.net/cafeimg/cf_img4/bg/edit09_03.gif":"http://i1.daumcdn.net/cafeimg/cf_img4/bg/edit01_03.gif"
		}
		swfobject.embedSWF("http://editor.daum.net/cafe_reply/2011011702/coca.swf", targetId, '21', '21', '9.0.45', false, flashvars, Coca.params);
	},
	/**
	 * ������ ���� ��ư ������ �����Ѵ�.
	 * <pre>
	 * "write"	: ����� (ū��ư)		[���]
	 * "reply"	: ��ۿ� (������ư)	[���] [���]
	 * "modify"	: ������ (������ư)	[����] [���]
	 * "confirm"	: ����� (������ư)	[Ȯ��] [���]
	 * </pre>
	 * @param {String} buttontype
	 */
	changeButtonType: function(buttontype) {
		if (!Sizzle(".btn_txt", this.$submit_sub)) return;
		var $buttonText = Sizzle(".btn_txt", this.$submit_sub)[0];
		
		switch (buttontype) {
			case "write":		// ����� (ū��ư)
				daum.$E(this.$submit).show();
				daum.$E(this.$submit_sub).hide();
				daum.$E(this.$cancel).hide();
				break;
			case "reply":		// ��ۿ� (������ư)
				$buttonText.innerHTML = "���";
				break;
			case "modify":	// ������ (������ư)
				$buttonText.innerHTML = "����";
				break;
			case "confirm":	// ����� (������ư)
				$buttonText.innerHTML = "Ȯ��";
				break;
		}
		
		if (buttontype != "write") {	// ������ư ����
			daum.$E(this.$submit).hide();
			daum.$E(this.$submit_sub).show();
			daum.$E(this.$cancel).show();
			// ��Ȳ�� �´� Ŭ������ ����
			this.$form.removeClassName("layout_reply");
			this.$form.removeClassName("layout_modify");
			this.$form.removeClassName("layout_confirm");
			this.$form.addClassName("layout_" + buttontype);
		}
	},
	/**
	 * ���� �̹��� �̸����� ������ ǥ�� �� �̹����� �����Ѵ�.
	 * <pre>
	 * oImage.imageUrl	: �̹��� ���
	 * oImage.imageName	: ���� �̹��� ���ϸ�
	 * oImage.imageSize	: �̹��� ũ��
	 * </pre>
	 * @param {Object} oImage
	 */
	setPreviewImage: function(result) {
		if (result) {
			this.imageUrl = result.imageUrl;
			this.imageName = result.imageName;
			this.imageSize = result.imageSize;
			
			var thumbUrl = this.imageUrl.replace("/image/", "/P35x35/");
			$E(this.$textarea.parentNode).addClassName("has_image");
			this.$uploadViewer.src = thumbUrl;
			daum.$E(this.$previewDelete).show();
		} else {
			daum.$E(this.$previewDelete).hide();
			this.$uploadViewer.src = 'http://i1.daumcdn.net/cafeimg/cf_img2/img_blank2.gif';
		}
		$E(this.$previewArea).show();
	},
	/**
	 * ������ �Է�â�� �ؽ�Ʈ�� �Է��Ѵ�.
	 * @param {String} value
	 */
	setComment: function(value) {
		var text = value;
		if (daum.String.trim(text) != "") {
			text = Memo.Util.unescapeHTML(text);
		}
		this.$textarea.value = text;
		this.checkTextBytes();
	},
	/**
	 * ������ �Է�â�� �ؽ�Ʈ�� ���̾� �ִ´�.
	 * @param {String} value
	 */
	appendComment: function(value) {
		this.$textarea.value += value;
		this.checkTextBytes();
	},
	/**
	 * �����͸� ǥ���Ѵ�.
	 * (���� : clear() �� ǥ��)
	 */
	show: function() {
		this.clear();
		this.$form.show();
		this.initImageUploader();
		this.$textarea.focus();
	},
	/**
	 * �����͸� �����. 
	 * (���� : clear() �� ����)
	 */
	hide: function() {
		this.clear();
		this.$form.hide();
	},
	/**
	 * �������� ������ �ʱ�ȭ �Ѵ�.
	 * ��� : �Է�â, �̸����� �̹���, �������ư
	 */
	clear: function() {
		this.setComment("");
		this.previewDeleteHandler();
		this.setControlValue({'isHidden': false});
	},
	/**
	 * �����͸� ��Ȱ��ȭ ��Ų��.
	 * @param {String} message �Է�â�� ǥ�� �� �޽���
	 */
	disable: function(message) {
		if (!this.$textarea) return;
		if ( typeof Sizzle(".menu_item_list", this.$form)[0] != "undefined" ) daum.$E(Sizzle(".menu_item_list", this.$form)[0]).hide();
		daum.$E(this.$submit).addClassName("opacity");
		message && this.setComment(message);
		this.$textarea.readOnly = true;
		this.disabled = true;
		this.hideSns();
	},
	/**
	 * �����͸� Ȱ��ȭ ��Ų��.
	 */
	enable: function() {
		if (!this.$textarea) return;
		this.$textarea.readOnly = false;
		
		var elMenuLists = Sizzle(".menu_item_list", this.$form);
		
		if (elMenuLists && elMenuLists.length) {
			daum.Element.show(elMenuLists[0]);
		}
		
		daum.$E(this.$submit).removeClassName("opacity");
		this.setComment("");
		this.disabled = false;
		this.showSns();
	}
};

/**
 * Coca Imageuploader initial function.
 * ������ ÷�� ���� ���δ�, ������ �̹��� ���δ� ���� ��� ��
 * @class
 * @ignore
 */
Coca = {
	callbackList: {},
	params: {
		quality: 'high',
		menu: 'false',
		swliveconnect: 'true',
		allowScriptAccess: 'always',
		wmode: 'transparent',
		scale: 'noscale',
		salign: 'LT'
	},
	on_upload_start: function(ctx){
		if (ctx != "my_image_uploader") {
			Coca.callbackList[ctx] && Coca.callbackList[ctx](null, ctx);
		}
	},
	on_upload_complete: function(result, ctx){
		var oResult = result.split("||");
		var imageName = oResult[0];
		var imageUrl = oResult[1].replace("/attach/", "/image/");
		var size = oResult[3];
		if (ctx == "my_image_uploader") {
			if( size > 1024 * 500 ) {
				alert("�̹��� ���� �ø���� �ִ� 500kb���� �����մϴ�.");
				return false;
			}
			Memo.Layer.Setting.uploadCompleteHandler(imageUrl);
		} else {
			Coca.callbackList[ctx] && Coca.callbackList[ctx]({
				imageName: imageName,
				imageUrl: imageUrl,
				size: size
			}, ctx);
		}
	},
	on_over_filesize: function(filename, maxsize, ctx){
		if (ctx == "my_image_uploader") {
			alert("�̹��� ���� �ø���� �ִ� 500kb���� �����մϴ�.");
			return false;
		}
		alert("�̹��� �뷮�� �ʹ� Ů�ϴ�. �ִ� 2MB���� �����մϴ�.");
	},
	on_error: function(msg, ctx){
		alert("���� ���ε忡 �����Ͽ����ϴ�.");
	}
};

/**
 * ���ٰԽ���, ����� ����ǥ�⿡ ���Ǵ� �ΰ���� ����
 * @name Memo.Util
 * @class ���ٰԽ���, ��ۿ� ���Ǵ� �ΰ����
 * @static
 */
Memo.Util = {
	/** @private */
	indexNum: 0,
	/**
	 * ÷�� �̹����� Ȯ��, ��� �մϴ�.
	 * *** _reply_list.html �� .longtail_attach_image ��ũ���� �����ϵ��� �մϴ�.
	 * @param {Element} $target	������ �̹��� ������Ʈ
	 */
	showImage: function($target) {
		var $container = daum.$E($target).getParent();
		var $container_wrap = daum.$E(daum.$E($container).getParent());
		var isLargeView = $container_wrap.hasClassName("attach_view_large");
		var $curImage = $container.getElementsByTagName("img")[0];
		var $newImage = document.createElement("img");
		
		var loadEvent = daum.addEvent($newImage, "load", function(ev) {
			daum.Event.stopObserving(loadEvent);
			$target.removeChild($target.getElementsByTagName("img")[0]);
			if (isLargeView) {
				$container_wrap.removeClassName("attach_view_large");
			} else {
				$container_wrap.addClassName("attach_view_large");
			}
			$target.appendChild($newImage);
		});
		
		if (isLargeView) {
			$newImage.src = $curImage.src.replace("/R474x0/", "/P85x110/");
		} else {
			$newImage.src = $curImage.src.replace("/P85x110/", "/R474x0/");
		}
	},
	/**
	 * ÷�ε� ������(������)�� Ȯ��, ��� �մϴ�.
	 * *** memo_reply_list.html �� .longtail_attach_video ��ũ���� �����ϵ��� �մϴ�.
	 * @param {Element} $target	������ ������(������) ������Ʈ
	 * @param {String} movType	������ ���� Ÿ��	"MY"=��Ʃ��, "MD"=Ƽ����
	 * @param {String} movId		������ ���� ID
	 */
	showVideo: function($target, movType, movId) {
		var $container = daum.$E($target).getParent();
		var $container_wrap = daum.$E(daum.$E($container).getParent());
		if (!$container_wrap.hasClassName("attach_view_large")) {
			var tag = {
				"MY": '<object width="425" height="344"><param name="movie" value="http://www.youtube.com/v/#{ID}&hl=en&fs=1&"></param><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><param name="wmode" value="transparent"></param><embed src="http://www.youtube.com/v/#{ID}&hl=en&fs=1&" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="425" height="344" wmode="transparent" ></embed></object>',
				"MD": "<object type='application/x-shockwave-flash' width='502px' height='399px' align='middle' classid='clsid:d27cdb6e-ae6d-11cf-96b8-444553540000' codebase='http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0'><param name='movie' value='http://flvs.daum.net/flvPlayer.swf?vid=#{ID}' /><param name='allowScriptAccess' value='always' /><param name='wmode' value='transparent' /><param name='allowFullScreen' value='true' /><param name='bgcolor' value='#000000' /><embed src='http://flvs.daum.net/flvPlayer.swf?vid=#{ID}' wmode='transparent' width='502px' height='399px' allowScriptAccess='always' type='application/x-shockwave-flash' allowFullScreen='true' bgcolor='#000000' ></embed></object>"
			};
			$container_wrap.addClassName("attach_view_large");
			var $player = document.createElement("div");
			$player.className = "message_video_player";
			$player.innerHTML = "<div>" + tag[movType].split("#{ID}").join(movId) + "</div>";
			$container.appendChild($player);
		} else {
			$container_wrap.removeClassName("attach_view_large");
			var $player = $C($container, "message_video_player")[0];
			$container.removeChild($player);
		}
	},
	/**
	 * ��� ���̶������� ǥ���մϴ�.
	 * ��ۿ� ��ȭ�� ���� ��� ����ǰ� �ֽ��ϴ�.
	 * @param {String} targetId	���� ������Ʈ ID
	 * @param {String} color	���̶���Ʈ ���� (��: ff0033)
	 * @param {Number} duration	���� �ð� (����: ms)
	 */
	highLightFadeOut: function(targetId, color, duration) {
		var convertHex = function(dec) {
			dec = dec.toString(16);
			return dec.length==1 ? '0'+dec : dec;
		}
		var getBackGroundColor = function(el) {
			el = el.parentNode;
			while (el) {
				var color;
				if (el.currentStyle) {
					color = el.currentStyle["backgroundColor"];
				} else if (window.getComputedStyle) {
					color = document.defaultView.getComputedStyle(el,null).backgroundColor;
				}
				if (el.tagName.toLowerCase()=="body" || (color!="" && color!="transparent" && color!="rgba(0, 0, 0, 0)")) {
					break;
				}
				el = el.parentNode;
			}
			if (color==undefined || color=="" || color=="transparent" || color=="rgba(0, 0, 0, 0)") color="#ffffff";
			var rgb = color.match(/rgba?\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(,\s*(\d{1,3})\s*)?\)/);
			if (rgb) {
				color = "#" + convertHex(parseInt(rgb[1])) + convertHex(parseInt(rgb[2])) + convertHex(parseInt(rgb[3]));
			}
			return color;
		}
		var $target = $(targetId);
		duration = duration || 1;
		color = color || "ffff33";
		$target.style.backgroundColor = "#" + color;
		daum.Fx.animate($target, "background-color:" + getBackGroundColor($target), { duration: duration });
	},
	/**
	 * �ؽ�Ƽ�� ���� �˾�â�� ����.
	 */
	popupTexticon: function() {
		window.open('http://cafe.daum.net/_texticon/pop_texticon2.html', 'texticon_help', 'width=340,height=410,toolbar=no,scrollbars=no,');
	},
	/**
	 * HTML��ƼƼ ���ڸ� ��� �Ϲ� ���ڷ� ġȯ�Ѵ�.
	 * (�ٹٲ� ũ�ν� ����¡�� �ذ��)
	 * @param {String} html
	 * @returns {String} ��ȯ �� ���ڿ�
	 */
	unescapeHTML: function(html) {
		var result = "";
		var temp = document.createElement("div");
		if (typeof temp.innerText != "undefined") {
			temp.innerHTML = html.replaceAll("\n", "<br/>");
			result = temp.innerText.replaceAll("<br/>", "\n");
		} else {
			temp.innerHTML = html;
			result = temp.textContent;
		}
		return result;
	},
	/**
	 * Durl �÷������� ���� ������ �Ѵ�.
	 * @param {Element} scopeEl �������� ������ ������Ʈ
	 */
	renderDurl: function(scopeEl) {
		try{
			var scopeEl = scopeEl || $('listForm');
			if(Bubble && Bubble.setDurlLink){
				Sizzle('div.content_viewer', scopeEl).each(function(div) {
					Bubble.setDurlLink(div);
				});
			}
		}catch(e){}
	}
};

/**
 * ���̾�޴���, �÷���Ŀ �� ���� ���� Namespace
 * @namespace
 * @ignore
 */
Memo.Widget = {};

/**
 * ���̾�޴���
 * @class
 * @ignore
 */
Memo.Widget.LayerManager = {
	arrLayers: [],
	isCloseArea: false,
	beforeLayerOwnerIdArr: [],
	registLayer: function(ownerEl, targetEl, pCallback, singleClass) {
		var singleClass = singleClass || false;
		var $ownerEl = $(ownerEl);
		var $targetEl = $(targetEl);
		if (!$ownerEl || !$targetEl){
			throw "owner or target is not exist... so LayerManager's registLayer Func is not worked ";
			return;
		}
		if (!$targetEl.id) $targetEl.id = $ownerEl.id +"_layer";
		var ind = this.indexOfOwner($ownerEl.id);
		if (ind==-1){
			this.arrLayers.push({'owner': $ownerEl.id, 'target': $targetEl.id, 'callback': pCallback, 'singleClass': singleClass});
		}else{
			this.arrLayers[ind] = {'owner': $ownerEl.id, 'target': $targetEl.id, 'callback': pCallback, 'singleClass': singleClass};
		}
		if(!this.isCloseArea){
			daum.Event.addEvent(document, 'mousedown', this.controlLayer.bindAsEventListener(this));
			this.isCloseArea = true;
		}
	},
	controlLayer: function(ev) {
		var el = daum.Event.getElement(ev);
		var curOwnerIndex = this.getOwnerIndex(el);
		if(this.beforeLayerOwnerIdArr.length>0){
			if(curOwnerIndex!=-1){
				var curOwnerId = this.arrLayers[curOwnerIndex].owner;
				var beforeInd = -1;
				for(var i=0;i<this.beforeLayerOwnerIdArr.length;i++){
					if(curOwnerId==this.beforeLayerOwnerIdArr[i]){
						beforeInd = i;
						break;
					}
				}
				
				if(beforeInd==-1){
					var workInd = 0;
					for(var i=this.beforeLayerOwnerIdArr.length;i>0;--i){
						var parentTarget = this.arrLayers[this.indexOfOwner(this.beforeLayerOwnerIdArr[i-1])].target;
						if($(curOwnerId).parentNode){
							var tempParent = $(curOwnerId).parentNode;
							while(tempParent){
								if($(tempParent).tagName=="BODY") break;
								if(tempParent.id && (tempParent.id==parentTarget)){
									workInd = i;
									break;
								}
								tempParent = tempParent.parentNode;
							}
						}
						if(workInd!=0) break;
					}
					this.checkHideLayer(workInd);
				}else if(beforeInd==this.beforeLayerOwnerIdArr.length-1){
					return;
				}else{
					this.checkHideLayer(beforeInd+1);
					return;
				}			
			}else{
				this.checkHideLayer(0);
				return;
			}
		}
		if(curOwnerIndex!=-1){
			this.addOpenLayer(this.arrLayers[curOwnerIndex].owner);
		}
	},
	addOpenLayer: function(id){
		if(this.beforeLayerOwnerIdArr[this.beforeLayerOwnerIdArr.length]!=id) this.beforeLayerOwnerIdArr.push(id);
	},
	getOwnerIndex: function(evDom){
		var parent = evDom;
		while(parent){
			if(parent.tagName=="" || parent.tagName=="BODY") return -1;
			var owner = this.indexOfOwner(parent.id);
			var target = this.indexOfTarget(parent.id);
			if(owner!=-1) return owner;
			if(target!=-1){
				if(this.arrLayers[target].singleClass){
					var viewerId = this.arrLayers[target].singleClass.viewerEl;
					var targetArr = this.indexOfTargetArr(parent.id);
					if(targetArr[$(viewerId).id] || targetArr[$(viewerId).id]>-1){
						return targetArr[$(viewerId).id];
					}
				}else{
					return target;
				}
			}
			if(parent.parentNode){
				parent = parent.parentNode;
			}else{
				break;
			}
		}
		return -1;
	},
	checkHideLayer: function(index){
		while(this.beforeLayerOwnerIdArr.length>index){
			var beforeLayerOwnerId = this.beforeLayerOwnerIdArr.pop();
			if(beforeLayerOwnerId) this.hideOneLayer(this.indexOfOwner(beforeLayerOwnerId));
		}
	},
	hideOneLayer: function(index){
		setTimeout(function(){
			if (typeof this.arrLayers[index].callback=="function"){
				this.arrLayers[index].callback.call();
			} else {
				if($E(this.arrLayers[index].target)) $E(this.arrLayers[index].target).hide();
			}
		}.bind(this),1);
	},
	exist : function(objId){	
		return this.indexOfLayers('target', objId) != -1;
	},
	existOwner : function(objId){ 
		return this.indexOfLayers('owner', objId) != -1;
	},
	indexOf: function(objId) {
		return this.indexOfLayers('target', objId)
	},
	indexOfOwner: function(objId) {
		return this.indexOfLayers('owner', objId);
	},
	indexOfTarget: function(objId) {
		return this.indexOfLayers('target', objId);
	},
	indexOfTargetArr: function(target){
		var returnArr = new Object();
		for(var i = 0,len=this.arrLayers.length; i < len; i++){
			if(this.arrLayers[i].target == target){
				returnArr[this.arrLayers[i].owner] = i;
			}
		}
		return returnArr;
	},
	indexOfLayers: function(key, objId) {
		for(var i = 0; i < this.arrLayers.length; i++){
			if(this.arrLayers[i][key] == objId){
				return i;
			}
		}
		return -1;
	},
	clearArrLayers: function() {
		this.arrLayers = [];
		this.beforeLayerOwnerIdArr = [];
	},
	release: function(){
		this.clearArrLayers();
	},
	clear: function() {
		this.beforeLayerOwnerIdArr = [];
	}
};

/**
 * �÷���Ŀ
 * @class
 * @ignore
 */
Memo.Widget.ColorPicker = {
	init: function() {
		this.isInit = false;
		this.colorPicker = $E('colorPicker');
		this.colorInput = $E("colorInput");
		this.colorThumb = $E("colorThumb");
		this.colorGradeArea = $E('colorGradeArea');
		this.col_div = $('chromaGradeBg');
		this.hue_div = $('hueGradeBg');

		daum.Event.addEvent($('colorInputBtn'), 'click', this.saveColor.bindAsEventListener(this));
		daum.Event.addEvent($('colorSwatches'), 'click', this.onClickSwatch.bindAsEventListener(this));
		daum.Event.addEvent($('colorGradeBtn'), 'click', this.onClickMore.bindAsEventListener(this));
		daum.Event.addEvent($('colorResetBtn'), 'click', this.resetColor.bindAsEventListener(this));

		daum.Event.addEvent(this.col_div, 'mousedown', this.onChromDown.bindAsEventListener(this));
		daum.Event.addEvent(this.col_div, 'mouseup', this.onChromUp.bindAsEventListener(this));
		daum.Event.addEvent(this.col_div, 'mousemove', this.onChromMove.bindAsEventListener(this));
		
		daum.Event.addEvent(this.hue_div, 'mousedown', this.onHueDown.bindAsEventListener(this));
		daum.Event.addEvent(this.hue_div, 'mouseup', this.onHueUp.bindAsEventListener(this));
		daum.Event.addEvent(this.hue_div, 'mousemove', this.onHueMove.bindAsEventListener(this));
		daum.Event.addEvent(this.hue_div, 'click', this.onHueClick.bindAsEventListener(this));

		this.col_width = 150;
		this.col_height = 120;

		this.rgb = {r:0, g:0, b:0 };
		this.hsv = {h:0, s:100, v:100 };

		this.hueChange();
	},
	setConfig: function(config) {
		this.isUseId = this.colorViewer.id;
		this.config = config;
		for (var i in config) this[i] = config[i];

		if(this.defaultColor=="initial"){this.defaultColor="transparent";} // safari -> initial

		if (this.defaultColor == "transparent") {
			this.colorThumb.setStyle('backgroundColor', 'transparent');
			this.colorThumb.setStyle('backgroundImage', 'url(http://i1.daumcdn.net/cafeimg/cf_img4/design/common/color_chip_clear2_n.gif)');
			this.colorInput.value = "����";
		} else {
			this.colorThumb.setStyle('backgroundColor', this.defaultColor);
			this.colorThumb.setStyle('backgroundImage', 'none');
			
			if(this.defaultColor.indexOf("rgb") != -1)
			{
				this.defaultColor = this.defaultColor.replace("rgb", "");
				this.defaultColor = this.defaultColor.replace("(", "");
				this.defaultColor = this.defaultColor.replace(")", "");
				this.defaultColor = this.defaultColor.replace(" ", "");
				this.defaultColor = this.defaultColor.split(",");
				this.defaultColor = "#" + this.rgb2hex(parseInt(this.defaultColor[0]), parseInt(this.defaultColor[1]), parseInt(this.defaultColor[2]));
			}
			this.colorInput.value = this.defaultColor;
		}
		
		if (this.pickerStyle){
			this.colorPicker.setCssText(this.pickerStyle);
		}else{
			this.colorPicker.setCssText("left: 0");
		}
		
		var moreBtn = $('colorGradeBtn');
		if(this.isOpen){
			moreBtn.className = "gradeon";
			this.colorGradeArea.show();
		}else{
			moreBtn.className = "gradeoff";
			this.colorGradeArea.hide();
		}
		(this.isTransparent) ? this.useTransparent(true) : this.useTransparent(false);
		this.hideColorPicker();
	},
	viewPicker: function(obj, config) {
		this.colorViewer = $E(obj);
		if (!this.colorViewer) return; 
		if(!this.isInit) { 
			this.init();
			this.isInit = true;
		}
		
		if (!this.isUseId || this.isUseId!=this.colorViewer.id || this.defaultColor != config.defaultColor) this.setConfig(config);
		
		if (this.colorPicker.visible()) {
			this.hideColorPicker();
		} else {
			this.showColorPicker();
		}
	},
	setPosition: function() {
		var isPosition = (this.isAppend) ? true : false;
		var p = daum.Element.getCoords(this.colorViewer, false, "longtailLayerManager");
		var height = this.colorViewer.offsetHeight+2;
		if (this.isAppend) {
			if (this.pickerStyle){
				//
			}else{
				this.colorPicker.setTop(height);
			}
		} else {
			this.colorPicker.setTop(p.top + height);
			this.colorPicker.setLeft(p.left);
		}
	},
	showColorPicker: function() {
		if (this.isAppend) {
			this.colorViewer.appendChild(this.colorPicker);
			if (daum.Browser.op) this.colorViewer.appendChild(this.colorPicker);
		}
		this.setPosition();
		this.colorPicker.show();
	},
	hideColorPicker: function() {
		if (this.isAppend) document.body.appendChild(this.colorPicker);
		this.colorPicker.hide();
	},
	saveColor: function(ev) {
		if(!this.isValidateColor(this.colorInput.value)){
			alert("��Ȯ�� ������ �Է����ּ���.\n��) #ffffff");
			this.colorInput.value = this.config.defaultColor;
			return; 
		}
		if(this.colorInput.value == "transparent" || this.colorInput.value == "����") {
			this.defaultColor = "transparent";
			this.setTransparent();
		} else {
			this.colorViewer.setStyle('backgroundImage', '');
			this.colorViewer.setStyle('backgroundColor', this.colorInput.value);
			this.colorThumb.style.backgroundColor = this.colorInput.value;
			this.defaultColor = this.colorInput.value;
			this.config.defaultColor = this.defaultColor;
		}		
		
		var currentColor = (this.colorInput.value=="����") ? "transparent" : this.colorInput.value;
		if (this.callback) this.callback(currentColor);
		this.colorPicker.hide();
	},
	resetColor: function() {
		if(this.defaultColor == "transparent" || this.defaultColor == "����"){
			this.setTransparent();
		}else{
			this.colorViewer.setStyle('backgroundColor', this.defaultColor);
			this.colorThumb.setStyle('backgroundColor', this.defaultColor);
			this.colorInput.value = this.defaultColor;
		}
		if (this.callback) this.callback(this.defaultColor, 'cancel');
	},
	setTransparent: function(){
		this.colorThumb.style.backgroundImage = "url(http://i1.daumcdn.net/cafeimg/cf_img4/design/common/color_chip_clear2_n.gif)";
		this.colorThumb.style.backgroundColor = 'transparent';
		this.colorViewer.style.backgroundImage = "url(http://i1.daumcdn.net/cafeimg/cf_img4/design/common/color_chip_clear2.gif)";
		this.colorViewer.style.backgroundColor = 'transparent';
		this.config.defaultColor = 'transparent';
		this.colorInput.value = "����";
	},
	isValidateColor: function(strColor){
		return /^(transparent|����|#([a-f0-9]{3}|[a-f0-9]{6}))$/i.test(strColor);
	},
	onClickSwatch: function(ev) {
		var swatch = daum.Event.getElement(ev);
		if (swatch.tagName.toLowerCase()!="div") return;

		if (swatch.id=="transY") {
			this.setTransparent();
			if (this.callback) this.callback('transparent');
		} else {
			var sColor = swatch.style.backgroundColor;
			if(sColor.indexOf("rgb") != -1)
			{
				sColor = sColor.replace("rgb", "");
				sColor = sColor.replace("(", "");
				sColor = sColor.replace(")", "");
				sColor = sColor.replace(" ", "");
				sColor = sColor.split(",");
				sColor = "#" + this.rgb2hex(parseInt(sColor[0]), parseInt(sColor[1]), parseInt(sColor[2]));
			}
			this.colorThumb.style.backgroundImage = "none";
			this.colorThumb.style.backgroundColor = sColor;
			this.colorViewer.style.backgroundImage = "none";
			this.colorViewer.style.backgroundColor = sColor;
			this.colorInput.value = sColor;
			this.config.defaultColor = sColor;
			
			if (this.callback) this.callback(this.colorInput.value);
		}
	},
	onClickMore: function(ev) {
		var moreBtn = $('colorGradeBtn');
		if (moreBtn.className == "gradeoff") {
			moreBtn.className = "gradeon";
			this.colorGradeArea.show();
		} else {
			moreBtn.className = "gradeoff";
			this.colorGradeArea.hide();
		}
	},
	useTransparent: function(isUse) {
		if(isUse) {
			$E('transY').show();
			$E('transN').hide();
		} else {
			$E('transY').hide();
			$E('transN').show();
		}
	},
	pageCoords: function(node) {
		var x = node.offsetLeft;
		var y = node.offsetTop;
		var parent = node.offsetParent;

		while (parent != null)
		{
			x += parent.offsetLeft;
			y += parent.offsetTop;
			parent = parent.offsetParent;
		}

		return {x: x, y: y};
	},
	fixCoords: function(node, x, y) {
        var nodePageCoords = this.pageCoords(node);

        x = (x - nodePageCoords.x) + document.documentElement.scrollLeft;
        y = (y - nodePageCoords.y) + document.documentElement.scrollTop;
		
        if (x < 0) x = 0;
        if (y < 0) y = 0;
        if (x > node.offsetWidth - 2) x = node.offsetWidth - 2;
        if (y > node.offsetHeight - 2) y = node.offsetHeight - 2;

		if (document.all) {
			x-=2; y-=2;
		} else {
			x--; y--;
		}

        return {x: x, y: y};
    },
	col_move: function(x,y) {
		var s = (x/(this.col_width-2))*100;
		var v = (1-y/(this.col_height-2))*100;

		s = Math.min(Math.max(s, 0), 100);
		v = Math.min(Math.max(v, 0), 100);

        this.hsv.s = s;
        this.hsv.v = v;
        this.changeColor();
	},
	changeColor: function() {
        this.rgb = this.hsv2rgb(this.hsv.h, this.hsv.s, this.hsv.v);
        var hex = this.rgb2hex(this.rgb.r, this.rgb.g, this.rgb.b);
		/*
		if (this.hsv.v>0) v = this.hsv.v-10; 
		rgbBorder = this.hsv2rgb(this.hsv.h, this.hsv.s, v);
		var hexBorder = this.rgb2hex(rgbBorder.r, rgbBorder.g, rgbBorder.b);
		*/
		//�߰��ڵ�
        this.colorThumb.style.backgroundImage = "none";
        this.colorViewer.style.backgroundImage = "none";
        
        this.colorThumb.style.backgroundColor = '#'+hex;
		this.colorInput.value = '#'+hex;
		this.colorViewer.style.backgroundColor = '#'+hex;
		this.config.defaultColor = '#'+hex;
		
		if (this.callback) this.callback(this.colorInput.value);
    },
	getBorderColor: function(hex) {
		hex = hex.replace("#","");
		var rgb = this.hex2rgb(hex);
		var hsv = this.rgb2hsv(rgb.r, rgb.g, rgb.b);

		if (hsv.v > 10) v = hsv.v-10;
		var rgbBorder = this.hsv2rgb(hsv.h, hsv.s, v);
		var hexBorder = this.rgb2hex(rgbBorder.r, rgbBorder.g, rgbBorder.b);
		return "#"+hexBorder;
	},
	onChromDown: function(evt) {
		this.isMouseDown = true;
		var pos = this.fixCoords(this.col_div, evt.clientX, evt.clientY);
		this.col_move(pos.x, pos.y);
	},
	onChromUp: function(evt) {
		this.isMouseDown = false;
		var pos = this.fixCoords(this.col_div, evt.clientX, evt.clientY);
		this.col_move(pos.x, pos.y);
	},
	onChromMove: function(evt) {
		if(this.isMouseDown) {
			var pos = this.fixCoords(this.col_div, evt.clientX, evt.clientY);
			this.col_move(pos.x, pos.y);
		}
	},
	hue_move: function(x,y) {
		var h = parseInt((y/(this.col_height))*360);
		this.hsv.h = Math.min(Math.max(h,0), 360);
        this.hueChange();
	},
	hueChange: function() {
        var hueRgb = this.hsv2rgb(this.hsv.h, 100, 100);
        var hueHex = this.rgb2hex(hueRgb.r, hueRgb.g, hueRgb.b);
		this.col_div.style.backgroundColor = '#'+hueHex;
    },
	onHueDown: function(){
		this.isMouseDown_Hue = true;
	},
	onHueUp: function(){
		this.isMouseDown_Hue = false;
	},
	onHueMove: function(evt) {
		if(this.isMouseDown_Hue) {
			var pos = this.fixCoords(this.hue_div, evt.clientX, evt.clientY);
			this.hue_move(pos.x, pos.y);
		}
	},
	onHueClick: function(evt) {
		var pos = this.fixCoords(this.hue_div, evt.clientX, evt.clientY);
		this.hue_move(pos.x, pos.y);
	},
	hex2rgb: function(str) {
		var rgb = {}
		rgb.r = (this.toDec(str.substr(0, 1)) * 16) + this.toDec(str.substr(1, 1));
		rgb.g = (this.toDec(str.substr(2, 1)) * 16) + this.toDec(str.substr(3, 1));
		rgb.b = (this.toDec(str.substr(4, 1)) * 16) + this.toDec(str.substr(5, 1));
		return rgb;
	},
	toDec: function(hexchars) {
		var hexchar = "0123456789ABCDEF";
		
		return hexchar.indexOf(hexchars.toUpperCase());
	},
	rgb2hex: function(r,g,b) {
		r = r.toString(16); if (r.length==1) r = '0'+r;
		g = g.toString(16); if (g.length==1) g = '0'+g;
		b = b.toString(16); if (b.length==1) b = '0'+b;

		return r+g+b;
	},
	hsv2rgb: function(h,s,v) {
		h /= 360;
		s /= 100;
		v /= 100;

		if (s == 0) {
			r = Math.floor(v * 255);
			g = Math.floor(v * 255);
			b = Math.floor(v * 255);
		} else {
			var_h = h*6;
			if (var_h==6) var_h = 0;
			var_i = Math.floor(var_h);
			var_1 = v*(1-s);
			var_2 = v*(1-s*(var_h-var_i));
			var_3 = v*(1-s*(1-(var_h-var_i)));
			
			if (var_i == 0) {var_r = v; var_g = var_3; var_b = var_1}
			else if (var_i == 1) {var_r = var_2; var_g = v; var_b = var_1}
			else if (var_i == 2) {var_r = var_1; var_g = v; var_b = var_3}
			else if (var_i == 3) {var_r = var_1; var_g = var_2; var_b = v}
			else if (var_i == 4) {var_r = var_3; var_g = var_1; var_b = v}
			else {var_r = v; var_g = var_1; var_b = var_2};
			
			r = Math.floor(var_r * 255);
			g = Math.floor(var_g * 255);
			b = Math.floor(var_b * 255);
		}
		return {r:r, g:g, b:b};
	},
	rgb2hsv: function(r, g, b) {
		var_R = ( r / 255 );
		var_G = ( g / 255 );
		var_B = ( b / 255 );

		var_Min = Math.min( var_R, var_G, var_B );
		var_Max = Math.max( var_R, var_G, var_B );
		del_Max = var_Max - var_Min;

		v = var_Max;

		if ( del_Max == 0 )	{
		   h = 0; s = 0;
		} else {
		   s = del_Max / var_Max;
		   del_R = (((var_Max-var_R)/6) + (del_Max/2)) / del_Max;
		   del_G = (((var_Max-var_G)/6) + (del_Max/2)) / del_Max;
		   del_B = (((var_Max-var_B)/6) + (del_Max/2)) / del_Max;

		   if      (var_R == var_Max) h = del_B-del_G;
		   else if (var_G == var_Max) h = (1/3) + del_R-del_B;
		   else if (var_B == var_Max) h = (2/3) + del_G-del_R;

		   if ( h < 0 ) h += 1;
		   if ( h > 1 ) h -= 1;
		}
		h = h*360;
		s = s*100;
		v = v*100;
		return { h:h, s:s, v:v }
	}
};

/**
 * �÷� ����Ʈ �ڽ�
 * @class
 * @ignore
 */
Memo.Widget.ColorSelectBox = function(selectEl, config){
	this.selectEl = $E(selectEl);
	if (!this.selectEl) return;
	
	this.isDisabled = false; 
	this.isTextColor = false;
	this.isTransparent = true;
	this.pickerStyle = null;
	
	for (var i in config) this[i] = config[i];
	
	this.isTransparent = (!this.isTextColor) && this.isTransparent;
	daum.Element.addClassName(this.selectEl, "colorSelectBox_styled");
	
	if(!this.isTextColor && daum.Browser.ie6){
		var underEl = document.createElement('div');
		underEl.className = "colorViewer";
		underEl.id = (this.selectEl.id!="") ? "d2w_"+this.selectEl.id : "d2w_"+Memo.Util.indexNum++;
		this.selectEl.appendChild(underEl);
		this.viewerEl = document.createElement('div');
		this.viewerEl.id = underEl.id+"colorCorverIE6";
		this.viewerEl.className =  "colorCorverIE6";
	}else{
		this.viewerEl = document.createElement('div');
		this.viewerEl.id = (this.selectEl.id!="") ? "d2w_"+this.selectEl.id : "d2w_"+Memo.Util.indexNum++;
		this.viewerEl.className = (this.isTextColor) ? "textColorViewer" : "colorViewer";
	}
	this.selectEl.appendChild(this.viewerEl);
	
	this.disabledEl = document.createElement('div');
	this.disabledEl.className = "colorSelectEnabled";
	this.selectEl.appendChild(this.disabledEl);
	
	DEFAULT_COLOR = (this.isTransparent) ? "transparent" : "#000000";
	this.defaultColor = (this.defaultColor != undefined && this.defaultColor != "") ? this.defaultColor : DEFAULT_COLOR;
	this.setColor(this.defaultColor);

	this.onClickHandler = this.onClickButton.bind(this);
	this.clickObserver = daum.Event.addEvent(this.viewerEl, 'click', this.onClickHandler);
	this.changeDisabled(this.isDisabled);
	if (Memo.Widget.LayerManager){
		var colorHandler = Memo.Widget.ColorPicker;
		var editor = this.parent;
		Memo.Widget.LayerManager.registLayer(this.viewerEl.id, 'colorPicker', function() {
			colorHandler.hideColorPicker();
			editor.fontColorClickHandler(editor.$menuFontColor);
		}, colorHandler);
	}
};

Memo.Widget.ColorSelectBox.prototype = {
	onClickButton: function(ev) {
		Memo.Widget.ColorPicker.viewPicker(this.selectEl, this);
		if(typeof(this.onShow) == "function"){
			this.onShow();
		}
	},
	changeDisabled: function(isDisabled) {
		this.isDisabled = isDisabled;
		if (isDisabled) {
			 this.disabledEl.className = "colorSelectDisabled";
		} else {
			 this.disabledEl.className = "colorSelectEnabled";
		}
	},
	setColor: function(color){
		if (!/^(transparent|����|#([a-f0-9]{3}|[a-f0-9]{6}))$/i.test(color)) return;
		this.defaultColor = color;
		if (color=="transparent") {
			this.selectEl.style.backgroundImage = "url(http://i1.daumcdn.net/cafeimg/cf_img4/design/common/color_chip_clear2.gif)";
			this.selectEl.style.backgroundColor = "transparent";
		} else {
			this.selectEl.style.backgroundColor = color;	
		}
	},
	release: function(){
		purge(this.selectEl);
		this.viewerEl = null;
		this.disabledEl = null;
		daum.Event.stopObserving(this.clickObserver);
	}
};

/**
 * �Է¿����Ϳ� ���� �Ǵ� ���̾� namespace
 * @namespace
 * @ignore
 */
Memo.Layer = {
	init: function() {
		if (!this.isInit) {
			daum.Event.addEvent(window, "load", this.appendToBody.bind(this));
			this.isInit = true;
		}
	},
	appendToBody: function() {
		var $layer_manager = daum.$("longtailLayerManager");
		var $body = document.body;
		$body.appendChild($layer_manager);
		Memo.isInitLayerManager = true;
	},
	show: function($parent, $layer) {
		var coords = daum.$E($parent).getCoords();
		daum.$E($layer).setPosition(coords.left, coords.top + 23);
		daum.Element.show($layer);
	},
	hide: function($layer) {
		daum.Element.hide($layer);
		daum.Element.posHide($layer);
	}
};
/**
 * �����Ϳ� ���̾� - ��ũ �Է�
 * @name Memo.Layer.Link
 * @class �����Ϳ� ���̾� - ��ũ �Է�
 * @ignore
 */
Memo.Layer.Link = {
	init: function() {
		if (this.isInit) return;
		this.isInit = true;
		this.$layer = $("longtailLayerLink");
		this.$input = Sizzle("input:text", this.$layer)[0];
		this.$btn_durl = Sizzle("a.btn_durl", this.$layer)[0];
		this.$btn_ok = Sizzle("a.btn_ok", this.$layer)[0];
		this.$btn_cancel = Sizzle("a.btn_cancel", this.$layer)[0];
		
		daum.addEvent(this.$input, "keydown", this.inputKeydownHandler.bind(this));
		daum.addEvent(this.$btn_durl, "click", this.makeShortClickHandler.bind(this));
		daum.addEvent(this.$btn_ok, "click", this.okClickHandler.bind(this));
		daum.addEvent(this.$btn_cancel, "click", this.cancelClickHandler.bind(this));
	},
	makeShortClickHandler: function(ev) {
		daum.Event.preventDefault(ev);
		if (this.getInputURL() == "") {
			alert("�ּҸ� �Է����ּ���.");
			return;
		}
		if (!Durl.makeShort) return;
		Durl.makeShort(this.getInputURL(), function(result) {
			if (result) {
				this.setInputURL(result);
			} else {
				alert("���� �� ���� URL �Դϴ�.");
			}
		}.bind(this));
	},
	okClickHandler: function(ev) {
		daum.Event.preventDefault(ev);
		if (this.parent) {
			var url = this.getInputURL();
			if (url == "" || url == "http://") {
				alert("�ּҸ� �Է����ּ���.");
				return;
			}
			if (url.indexOf("http://") != 0) {
				url = "http://" + url;
			}
			var urlRegEx = /^http(s)?:\/\/((\d+\.\d+\.\d+\.\d+)|(([\w-]+\.)+([a-z,A-Z][\w-]*)))(:[1-9][0-9]*)?(.*)/i;
			if (!urlRegEx.test(url)) {
				alert("�ùٸ��� ���� URL�Դϴ�.");
				this.setInputURL("");
				this.$input.focus();
				return;
			}
			
			this.parent.appendComment(url + " ");
			this.parent.linkClickHandler(this.$parent);
		}
	},
	cancelClickHandler: function(ev) {
		daum.Event.preventDefault(ev);
		if (this.parent) {
			this.parent.linkClickHandler(this.$parent);
		}
	},
	inputKeydownHandler: function(ev) {
		if (ev.keyCode == 13) {
			this.okClickHandler(ev);
		}
	},
	getInputURL: function() {
		return daum.String.trim(this.$input.value);
	},
	setInputURL: function(value) {
		this.$input.value = value;
	},
	show: function(parent, $parent) {
		this.parent = parent;
		this.$parent = $parent;
		this.viewerEl = parent.$item_link;
		this.setInputURL("http://");
		Memo.Layer.show($parent, this.$layer);
		setTimeout(function(){try{this.$input.focus();this.$input.select();}catch(e){}}.bind(this), 100);
	},
	hide: function() {
		Memo.Layer.hide(this.$layer);
	}
};
/**
 * �����Ϳ� ���̾� - �̸�Ƽ�� ����
 * @name Memo.Layer.Emoticon
 * @class �����Ϳ� ���̾� - �̸�Ƽ�� ����
 * @ignore
 */
Memo.Layer.Emoticon = {
	init: function() {
		if (this.isInit) return;
		this.isInit = true;
		this.$layer = $("emoticonLayer");
		daum.addEvent(this.$layer, "click", this.emoticonClickHandler.bind(this));
	},
	emoticonClickHandler: function(ev) {
		daum.Event.preventDefault(ev);
		var $target = daum.Event.getElement(ev);
		if (this.parent && $target) {
			this.parent.appendComment("/"+$target.alt+"/");
		}
	},
	show: function(parent, $parent) {
		this.parent = parent;
		this.$parent = $parent;
		this.viewerEl = parent.$item_emoticon;
		Memo.Layer.show($parent, this.$layer);
	},
	hide: function() {
		Memo.Layer.hide(this.$layer);
	}
};
/**
 * �����Ϳ� ���̾� - ������ �̹���, �ؽ�Ƽ�� �� ����
 * @name Memo.Layer.Setting
 * @class �����Ϳ� ���̾� - ������ �̹���, �ؽ�Ƽ�� �� ����
 * @ignore
 */
Memo.Layer.Setting = {
	type: "",
	blankImage: "http://i1.daumcdn.net/cafeimg/cf_img2/img_blank2.gif",
	init: function() {
		if (this.isInit) return;
		this.isInit = true;
		this.$layer = $("longtailLayerSetting");
		this.$layer_background = $("longtailLayerSettingBackground");
		this.$layer_wrap = $("longtailLayerSettingWrap");
		this.$option_image = $E(Sizzle(".option_image", this.$layer)[0]); 
		this.$btn_ok = Sizzle("a.btn_ok", this.$layer)[0];
		this.$btn_cancel = Sizzle("a.btn_cancel", this.$layer)[0];
		this.$btn_wrap = Sizzle(".btn_wrap", this.$layer)[0];
		this.$check_texticon = $("optionTexticon");
		this.$type = Sizzle("[NAME=my_image_type]", this.$layer);
		this.$type_blog = $E("imageBlogWrap");
		this.$type_self = $E("imageSelfWrap");
		this.$preview_blog = Sizzle(".option_preview_myimage", this.$type_blog)[0];
		this.$preview_self = Sizzle(".option_preview_myimage", this.$type_self)[0];
		this.$preview_blog_delete = Sizzle(".btn_delete", this.$type_blog)[0];
		this.$preview_self_delete = Sizzle(".btn_delete", this.$type_self)[0];
		
		this.initSetType();
		this.initTypeRadio(this.$type);
		
		if (this.$check_texticon) {
			daum.addEvent(this.$check_texticon, "click", this.texticonCheckHandler.bind(this));
		}
		daum.addEvent(Sizzle(".btn_load_image", this.$type_blog)[0], "click", this.blogImageClickHandler.bind(this));
		daum.addEvent(this.$preview_blog_delete, "click", this.deleteBlogPreviewHandler.bind(this));
		daum.addEvent(this.$preview_self_delete, "click", this.deleteSelfPreviewHandler.bind(this));
		daum.addEvent(this.$btn_ok, "click", this.okClickHandler.bind(this));
		daum.addEvent(this.$btn_cancel, "click", this.cancelClickHandler.bind(this));
	},
	visible : function(){
		return daum.Element.visible(this.$layer);
	},
	initTypeRadio: function($el) {
		for (var i=0, len=$el.length; i<len; i++) {
			daum.addEvent($el[i], "click", this.typeClickHandler.bind(this));
		}
		if (this.type == "blog") {
			$("optionMyImageBlog").click();
		} else if (this.type == "self") {
			$("optionMyImageSelf").click();
		}
	},
	initSetType: function() {
		if (!CAFEAPP.ui) return;
		this.type = "self";
		if (CAFEAPP.ui.IMGSVCTYPE == "B") {
			this.type = "blog";
		}
		if (this.$preview_blog.src != this.blankImage) {
			daum.$E(this.$preview_blog_delete).show();
		}
		if (this.$preview_self.src != this.blankImage) {
			daum.$E(this.$preview_self_delete).show();
		}
	},
	initImageUploader: function() {
		var flashvars = {
			coca_service: "CafeWebzineCubeCoca",
			coca_ctx: "my_image_uploader",
			service: "cafe",
			sname: "cafe",
			sid: "cafe",
			single_selection: true,
			coca_skin: "http://i1.daumcdn.net/cafeimg/cf_img4/design/common/bt_search.gif"
		}
		swfobject.embedSWF("http://editor.daum.net/coca_service/1.1.18/coca.swf?ver=1", "coca_uploader", '56', '21', '9.0.28', false, flashvars, Coca.params);
	},
	texticonCheckHandler: function(ev) {
		if (this.parent) {
			this.parent.isTexticon = this.$check_texticon.checked;
		}
	},
	okClickHandler: function(ev) {
		daum.Event.preventDefault(ev);
		this.setMyImage();
		if (this.parent) {
			this.parent.settingClickHandler(this.$parent);
		} else {
			this.hide();
		}
	},
	cancelClickHandler: function(ev) {
		daum.Event.preventDefault(ev);
		if (this.parent) {
			this.parent.settingClickHandler(this.$parent);
		} else {
			this.hide();
		}
	},
	typeClickHandler: function(ev) {
		var select_type = this.getValue(this.$type);
		switch (select_type) {
			case "blog":
				this.$type_blog.show();
				this.$type_self.hide();
				break;
			case "self":
				this.$type_blog.hide();
				this.$type_self.show();
				break;
		}
		this.isChanged = true;
	},
	uploadCompleteHandler: function(imageUrl) {
		this.$preview_self.src = imageUrl.replace("/image/", "/R33x33/");
		daum.$E(this.$preview_self_delete).show();
		this.isChanged = true;
	},
	blogImageClickHandler: function() {
		MemoBoard.getBlogProfileImage(this.getBlogImageCompleteHandler.bind(this));
	},
	getBlogImageCompleteHandler: function(result) {
		if (result) {
			this.$preview_blog.src = result;
			daum.$E(this.$preview_blog_delete).show();
			this.isChanged = true;
		} else {
			alert("���α׿� ��ϵ� ������ �̹����� �����ϴ�.");
		}
	},
	deleteBlogPreviewHandler: function(ev) {
		daum.preventDefault(ev);
		this.$preview_blog.src = this.blankImage;
		daum.$E(this.$preview_blog_delete).hide();
		this.isChanged = true;
	},
	deleteSelfPreviewHandler: function(ev) {
		daum.preventDefault(ev);
		this.$preview_self.src = this.blankImage;
		daum.$E(this.$preview_self_delete).hide();
		this.isChanged = true;
	},
	setMyImage: function() {
		if (typeof MemoBoard === "undefined") return;
		var selectType = this.getValue(this.$type);
		var imageServiceType = "";
		var myImageUrl = null;
		switch (selectType) {
			case "blog":
				myImageUrl = this.$preview_blog.src;
				imageServiceType = "B";
				break;
			case "self":
				myImageUrl = this.$preview_self.src.replace("/R33x33/", "/image/");
				imageServiceType = "U";
				break;
		}
		
		if (!myImageUrl || myImageUrl == this.blankImage) {
			imageServiceType = "I";
		}
		if (this.isChanged) {
			MemoBoard.changeProfileImage(imageServiceType, myImageUrl, this.changeProfileImageCompleteHandler.bind(this));
		}
	},
	setTexticonCheck: function(isCheck) {
		if (this.$check_texticon) {
			this.$check_texticon.checked = isCheck;
		}
	},
	changeProfileImageCompleteHandler: function(result) {
		if (result) {
			this.replaceProfileImagePreview();
		} else {
			alert("�� �̹��� ����� �����߽��ϴ�.");
		}
	},
	replaceProfileImagePreview: function() {
		if(!this.parent) {return;}
		var datainfo = this.parent.datainfo;
		var $pimgWrap = $("pimgWrap_" + datainfo);
		var imageUrl = null;
		if (!datainfo || !$pimgWrap) return;
		
		var selectType = this.getValue(this.$type);
		if (selectType == "blog") {
			imageUrl = this.$preview_blog.src;
		} else if (selectType == "self") {
			imageUrl = this.$preview_self.src;
		}
		
		if (imageUrl && imageUrl != this.blankImage) {
			$pimgWrap.innerHTML = "<img src=\"" + imageUrl + "\" width=\"32\" height=\"32\" alt=\"\" />";
		} else {
			$pimgWrap.innerHTML = "<div class=\"blank_thumb\">&nbsp;</div>";
		}
	},
	getValue: function($el) {
		for (var i=0, len=$el.length; i<len; i++) {
			if ($el[i].checked) {
				return $el[i].value;
			}
		}
		return false;
	},
	showImageSetting: function() {
		this.$option_image.show();
	},
	hideImageSetting: function() {
		daum.$E(this.$layer).addClassName("only_texticon");
		this.$option_image.hide();
		daum.$E(this.$btn_wrap).hide();
	},
	resizeBackground: function() {
		if (this.$layer_background) {
			var width = this.$layer_wrap.offsetWidth;
			var height = this.$layer_wrap.offsetHeight;
			daum.Element.setSize(this.$layer_background, width, height);
		}
	},
	show: function(parent, $parent) {
		this.isChanged = false;
		this.$parent = $parent;

		if(parent){
			this.parent = parent;	// editor
			this.viewerEl = parent.$item_setting;
			
			if (this.parent.mode == "reply") {
				this.hideImageSetting();
			} else if (this.parent.mode == "memo") {
				this.showImageSetting();
			}
			this.setTexticonCheck(this.parent.isTexticon);
		}
		
		// Initialize Image Uploader
		if (!this.isInitImageUploader) {
			this.isInitImageUploader = true;
			this.initImageUploader();
		}
		
		Memo.Layer.show($parent, this.$layer);
		this.resizeBackground();
	},
	hide: function() {
		Memo.Layer.hide(this.$layer);
	}
}

/**
 * @class �����Ϳ� ���Ǵ� ��Ʈ
 * @static
 */
Memo.Message = {
	NO_COMMENTS: "��ϵ� ����� �����ϴ�. ����� ����� �ּ���.",
	DENY_PERMISSION: "��۾��� ������ �����ϴ�.",
	DENY_ACCESS: "�������� ��η� �������� �ʾҽ��ϴ�.",
	COMMENT_FLOODED: "��� ����� 9,999�������� �����մϴ�.",
	NOT_LOGIN: "�α����� �ϼž� ��ۿ� ���� �� �� �ֽ��ϴ�.",
	NOT_WRITE_MEMBER: "ȸ���� ����� �� �� �����ϴ�.",
	NOT_WRITE_SEARCH: "�˻��� ���� ������ ���� �ۼ� �����մϴ�.",
	NO_AUTH_SIMPLEID: "�������̵�� ȸ�� ���� �� ���ۼ��� �����մϴ�.",
	MEMO_OVERFLOW: "�� �� �޸����� �Ϸ� �ִ� 99,999������ �� ����� �����մϴ�."
};

/**
 * @class DWR ���� ���� ��Ʈ�ѷ�
 */
DWRErrorController = {
	/**
	 * ����ǥ�� ������ ���� �ʱ�ȭ
	 */
	install: function() {
		if (this.isInit) return;
		this.isInit = true;
		if (!dwr || !dwr.engine) {
			throw "cannot find 'dwr' object. 'dwrEngine.js' required.";
		}
		dwr.engine.setErrorHandler(this.handleError);
	},
	/** @private */
	handleError: function(errorMessage, exception) {
		if (exception.code == "LOGIN" || exception.code == "LOGIN_SIMPLE" || exception.code.indexOf("����") != -1) {
			errorHandler = DWRErrorController.loginErrorHandler;
		} else {
			errorHandler = DWRErrorController.defaultErrorHandler;
		}
		errorHandler(errorMessage, exception);
	},
	/** @private */
	loginErrorHandler: function(errorMessage, exception){
		var url = encodeURIComponent(window.location.href);
		if (exception.code == "LOGIN") {
			window.location.href = "http://www.daum.net/Mail-bin/login.html?daumauth=1&category=cafe&url="+ url; 
		} else if (exception.code == "LOGIN_SIMPLE") {	// �������̵� ������ ����
			if (CAFEAPP.GRPID) {
				window.open('/_c21_/poplogin?grpid=' + CAFEAPP.GRPID + '&checksimpleid=Y', 'poplogin', 'width=450,height=300,resizable=no,scrollbars=no');
			}
		} else if (exception.code.indexOf("����") != -1) {	// ���� ���� ����
			window.location.href = "http://login.daum.net/Mail-bin/logout.cgi?url=http://www.daum.net/doc/nospam.html?nil_profile=logout";
		}
	},
	/** @private */
	defaultErrorHandler: function(errorMessage, exception) {
		if (!exception || (!exception.stackTrace && (exception.name || "").indexOf("dwr") < 0)) {
			alert("Ŭ���̾�Ʈ �����Դϴ�. \n���� ���� : " + exception.viewMessage, ",\n�ּ� : " + exception.fileName, "\n�ټ� : " +  exception.lineNumber);
		} else {
			alert(exception.viewMessage);
		}
	}
}

/**
 * @class DWR ��� ��Ȳ�� ǥ���ϱ� ���� ��Ʈ�ѷ�
 */
DWRConnectionController = {
	/**
	 * ��� ��Ȳ ǥ�ø� ���� �����ϴ� ���̾� ���
	 */
	install: function() {
		if (this.isInit) return;
		this.isInit = true;
		if (!dwr || !dwr.engine) {
			throw "cannot find 'dwr' object. 'dwrEngine.js' required.";
		}
		this.DWRConnectionBox = $E('DWRConnectionBox');
		if (this.DWRConnectionBox.parentNode.tagName.toLowerCase() != "body") {
			document.body.appendChild(this.DWRConnectionBox);
		}
		
		dwr.engine.setPreHook(this.showConnectionBox.bind(this, "������ ����� �Դϴ�."));
		dwr.engine.setPostHook(this.hideConnectionBox.bind(this));
	},
	/** @private */
	showConnectionBox: function(msg) {
		if (document.compatMode == "CSS1Compat") { // standard mode
			var clientHeight = document.documentElement.clientHeight;
			var scrollTop = document.documentElement.scrollTop;
		} else { // quirks mode
			var clientHeight = document.body.clientHeight;
			var scrollTop = document.body.scrollTop;
		}
		
		var top = clientHeight + scrollTop;
		top -= 50;
		this.DWRConnectionBox.setTop(top);
		
		if (msg) {
			this.DWRConnectionBox.innerHTML = msg;
			window.status= msg;
		}
		this.DWRConnectionBox.show();
	},
	/** @private */
	hideConnectionBox: function() {
		window.status= "";
		this.DWRConnectionBox.hide();
	}
}