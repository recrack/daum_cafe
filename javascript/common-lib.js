/*
 * @overview Jigu Javascript Framework, v1.0
 * Copyright (c) 2009 Front-end Technology Center, Daum Communications.
 * 
 * $Version : 1.0 $
 * $Date : 2010-06-18 15:35 $
 * $Revision : 179 $
 * $Build : 493 $
 * 
 * Project site: http://play.daumcorp.com/display/ftst/Jigu+Javascript+Framework
 * Licensed under Daum Common License : http://dna.daumcorp.com/forge/docs/daum-license-1.0.txt
 */
(function() {
    if (!window.daum || !window.daum.extend) {
        var A = window.daum = {};
        A.extend = function(D, E, C) {
            var B = C !== undefined ? C : true,
                F;
            for (F in E) {
                if (!D[F] || B) {
                    D[F] = E[F]
                }
            }
            return D
        }
    } else {
        return
    }
    A.extend(A, {
        version: "1.0_r179",
        Array: {
            compact: function(B) {
                if (!B) {
                    return []
                }
                var C = [],
                    D;
                for (D = 0; D < B.length; D += 1) {
                    if (!(B[D] === null || typeof(B[D]) === "undefined")) {
                        C.push(B[D])
                    }
                }
                return C
            },
            each: function(B, D) {
                if (Array.prototype.forEach) {
                    return B.forEach(D)
                }
                for (var C = 0; C < B.length; C += 1) {
                    D(B[C], C)
                }
            },
            indexOf: function() {
                if ([].indexOf) {
                    return function(B, C) {
                        return B.indexOf(C)
                    }
                } else {
                    return function(B, D) {
                        for (var C = 0; C < B.length; C += 1) {
                            if (B[C] === D) {
                                return C
                            }
                        }
                        return -1
                    }
                }
            }(),
            contains: function(B, C) {
                return B.indexOf(C) > -1
            }
        },
        Browser: {
            ua: navigator.userAgent.toLowerCase(),
            offset: {
                width: 0,
                height: 0
            },
            browserInit: function() {
                this.ie = this.ua.indexOf("msie") != -1;
                this.ie_sv1 = this.ua.indexOf("sv1") != -1;
                this.ie_sv2 = this.ua.indexOf("sv2") != -1;
                this.ie6 = this.ua.indexOf("msie 6") != -1;
                this.ie7 = this.ua.indexOf("msie 7") != -1;
                this.ie8 = this.ua.indexOf("msie 8") != -1;
                this.ff = this.ua.indexOf("firefox") != -1 && this.ua.indexOf("navigator") == -1;
                this.ff2 = this.ff && this.ua.indexOf("firefox/2.") != -1;
                this.ff3 = this.ff && this.ua.indexOf("firefox/3.") != -1;
                this.sf = this.ua.indexOf("safari") != -1 && this.ua.indexOf("chrome") == -1;
                this.webkit = this.ua.indexOf("applewebkit") != -1;
                this.op = this.ua.indexOf("opera") != -1;
                this.cr = this.ua.indexOf("chrome/") != -1;
                this.ns = this.ua.indexOf("netscape") != -1 || (this.ua.indexOf("firefox") != -1 && this.ua.indexOf("navigator") != -1);
                this.gecko = this.ua.indexOf("gecko") != -1;
                this.infopath = this.ua.indexOf("infopath") != -1;
                this.etc = this.gecko && this.ff && this.ns;
                this.win = this.ua.indexOf("win") != -1;
                this.vista = this.ua.indexOf("nt 6") != -1;
                this.xp = this.ua.indexOf("nt 5.1") != -1;
                this.w2k = this.ua.indexOf("nt 5.0") != -1;
                this.w98 = this.ua.indexOf("windows 98") != -1;
                this.mac = this.ua.indexOf("mac") != -1;
                this.unix = !(this.win || this.mac);
                this.versioning();
                return
            },
            versioning: function() {
                if (this.ie) {
                    if (this.ie8) {
                        this.ie7 = this.ie6 = this.ie_sv2 = this.ie_sv1 = false
                    }
                    if (this.ie7) {
                        this.ie6 = this.ie_sv2 = this.ie_sv1 = false
                    }
                }
                if (this.ff) {
                    if (this.ff3) {
                        this.ff2 = false
                    }
                }
                if (this.sf && this.cr) {
                    this.sf = false
                }
            }
        },
        Element: {
            cleanBlankNodes: function(C) {
                var D = A.$(C),
                    B = D.firstChild;
                try {
                    do {
                        if (B.nodeType === 3 && !/\S/.test(B.nodeValue)) {
                            D.removeChild(B)
                        }
                    } while (B = B.nextSibling)
                } catch (D) {}
                return D
            },
            getChildElements: function(D) {
                var C = A.$(D).firstChild,
                    B = [];
                try {
                    do {
                        if (C.nodeType === 1) {
                            B.push(C)
                        }
                    } while (C = C.nextSibling)
                } catch (E) {}
                return B
            },
            getElementsByClassName: function(F, C) {
                if (document.getElementsByClassName.toString().indexOf("code") > 0) {
                    return A.$A(F.getElementsByClassName(C))
                }
                var G = F == document || F == document.body || F == window;
                if (G || F.id) {
                    return A.$$((G ? "" : "#" + F.id + " ") + "." + A.String.trim(C).replace(/\s+/g, "."))
                }
                var B = A.$(F).getElementsByTagName("*"),
                    E = [],
                    D;
                for (D = 0; D < B.length; D += 1) {
                    if (A.Element.hasClassName(B[D], C)) {
                        E.push(B[D])
                    }
                }
                return (E.length > 0) ? E : []
            },
            getFirstChild: function(B) {
                var C = A.$(B).firstChild;
                while (C && C.nodeType !== 1) {
                    C = C.nextSibling
                }
                return C
            },
            getLastChild: function(C) {
                var B = A.$(C).lastChild;
                while (B && B.nodeType !== 1) {
                    B = B.previousSibling
                }
                return B
            },
            getNext: function(C) {
                var B = A.$(C).nextSibling;
                while (B && B.nodeType !== 1) {
                    B = B.nextSibling
                }
                return B
            },
            getPrev: function(B) {
                var C = A.$(B).previousSibling;
                while (C && C.nodeType !== 1) {
                    C = C.previousSibling
                }
                return C
            },
            getParent: function(B) {
                return A.$(B).parentNode
            },
            getCoords: function(C, D, I) {
                var F = D || false,
                    J = A.$(I) || false,
                    G = A.$(C),
                    K = G.offsetWidth,
                    E = G.offsetHeight,
                    H = {
                        left: 0,
                        top: 0,
                        right: 0,
                        bottom: 0
                    },
                    B;
                while (G) {
                    H.left += G.offsetLeft || 0;
                    H.top += G.offsetTop || 0;
                    G = G.offsetParent;
                    if (F) {
                        if (G) {
                            if (G.tagName == "BODY") {
                                break
                            }
                            B = A.Element.getStyle(G, "position");
                            if (B !== "static") {
                                break
                            }
                        }
                    }
                    if (J && J == G) {
                        break
                    }
                }
                H.right = H.left + K;
                H.bottom = H.top + E;
                return H
            },
            getCoordsTarget: function(C, B) {
                return A.Element.getCoords(C, false, B)
            },
            getStyle: function(E, F, D) {
                var H = A.$(E),
                    B, G, C, I = D || F;
                if (F.toLowerCase() == "float") {
                    C = (A.Browser.ie) ? "styleFloat" : "cssFloat"
                } else {
                    C = F
                }
                if (H.currentStyle) {
                    G = (C.indexOf("-") !== -1) ? C.replace(/[\-](.)/g, function(K, J) {
                        return J.toUpperCase()
                    }) : C;
                    B = H.currentStyle[G]
                } else {
                    G = (/[A-Z]/.test(I)) ? I.replace(/([A-Z])/g, function(K, J) {
                        return "-" + J.toLowerCase()
                    }) : I;
                    B = document.defaultView.getComputedStyle(H, null).getPropertyValue(G)
                }
                return B
            },
            hasClassName: function(G, F) {
                var I = A.String.trim(A.$(G).className),
                    D = A.String.trim(F),
                    C = 0,
                    B, H, E;
                if (D.indexOf(" ") > 0) {
                    B = D.replace(/\s+/g, " ").split(" "), H = I.split(" ");
                    B.each(function(J) {
                        C += (H.indexOf(J) > -1) ? 1 : 0
                    });
                    E = B.length === C
                } else {
                    E = I.length > 0 && (I == D || new RegExp("(^|\\s)" + D + "(\\s|$)").test(I))
                }
                return E
            },
            visible: function(B) {
                var C = A.$(B);
                return !(C.offsetWidth === 0 && C.offsetHeight === 0)
            },
            show: function(B, D) {
                var C = A.$(B);
                C.style.display = D || "block";
                return C
            },
            hide: function(B) {
                var C = A.$(B);
                C.style.display = "none";
                return C
            },
            toggle: function(B, D) {
                var C = A.$(B);
                return (A.Element.visible(C)) ? A.Element.hide(C) : A.Element.show(C, D || "block")
            },
            addClassName: function(C, B) {
                var D = A.$(C);
                if (A.Element.hasClassName(D, B)) {
                    return D
                }
                D.className = (A.String.trim(D.className) === "") ? B : D.className + " " + B;
                return D
            },
            removeClassName: function(C, B) {
                return A.Element.replaceClassName(C, B, "")
            },
            replaceClassName: function(C, F, G) {
                var D = A.$(C),
                    E = D.className.split(" "),
                    B;
                for (B = 0; B < E.length; B += 1) {
                    if (E[B] == F) {
                        E[B] = G
                    }
                }
                D.className = A.String.replaceAll(A.String.trim(E.join(" ")), /\s+/, " ");
                return D
            },
            setOpacity: function(B, D) {
                var C = A.$(B);
                C.style.filter = "alpha(opacity=" + D * 100 + ")";
                C.style.opacity = C.style.MozOpacity = C.style.KhtmlOpacity = D;
                return C
            }
        },
        Event: {
            observer: [],
            EVENTID: 0,
            crossEvent: function() {
                var B = {};
                if ( !! document.addEventListener) {
                    B.add = function(D) {
                        var C = D.type;
                        if (C.toLowerCase() == "mousewheel" && A.Browser.ff) {
                            C = "DOMMouseScroll"
                        }
                        D.src.addEventListener(C, D.handler, D.isCapture)
                    };
                    B.remove = function(D) {
                        var C = D.type;
                        if (C.toLowerCase() == "mousewheel" && A.Browser.ff) {
                            C = "DOMMouseScroll"
                        }
                        D.src.removeEventListener(C, D.handler, D.isCapture)
                    }
                } else {
                    B.add = function(D) {
                        var C = D.type;
                        if (C.toLowerCase() == "dommousescroll") {
                            C = "mousewheel"
                        }
                        D.src.attachEvent("on" + C, D.handler)
                    };
                    B.remove = function(D) {
                        var C = D.type;
                        if (C.toLowerCase() == "dommousescroll") {
                            C = "mousewheel"
                        }
                        D.src.detachEvent("on" + C, D.handler)
                    }
                }
                return B
            }(),
            bindedHandlerRegister: [],
            getBindedHandler: function(G, F) {
                var E = A.Event.bindedHandlerRegister,
                    B = -1,
                    D, C;
                for (D = 0, loop = E.length; D < loop; D += 1) {
                    if (E[D].src === G && E[D].handler === F) {
                        B = D;
                        break
                    }
                }
                if (B >= 0) {
                    return E[B].bindedHandler
                } else {
                    C = A.Function.bindAsEventListener(F, G);
                    E.push({
                        src: G,
                        handler: F,
                        bindedHandler: C
                    });
                    return C
                }
            },
            addEvent: function(F, I, J, E) {
                var B = A.$(F),
                    H = false,
                    D = -1,
                    C = A.Event.EVENTID++,
                    G = {
                        src: B,
                        type: I,
                        handler: J,
                        isCapture: E || false
                    };
                A.Event.observer[C] = G;
                A.Event.crossEvent.add(G);
                return C
            },
            removeEvent: function(F, E, D, C) {
                var B = A.Event.observer;
                if ( !! F && !E && !D) {
                    A.Event.crossEvent.remove(B[F]);
                    delete A.Event.observer[F]
                } else {
                    var H = A.$(F);
                    A.Event.crossEvent.remove({
                        src: H,
                        type: E,
                        handler: D,
                        isCapture: C || false
                    });
                    for (var G in B) {
                        if (B[G].src === H && B[G].type === E && B[G].handler === D && B[G].isCapture === (C || false)) {
                            delete A.Event.observer[G];
                            break
                        }
                    }
                }
            },
            stopObserving: function(B) {
                if (A.Event.observer[B]) {
                    A.Event.removeEvent(B)
                }
            },
            hasObserver: function(F, D) {
                if (typeof F === "number") {
                    return !!A.Event.observer[F]
                } else {
                    var C = false,
                        B = A.Event.observer;
                    for (var E in B) {
                        if (B[E].src === F && B[E].type === D) {
                            C = true;
                            break
                        }
                    }
                    return C
                }
            },
            stopEvent: function(B) {
                A.Event.stopPropagation(B);
                A.Event.preventDefault(B);
                return false
            },
            preventDefault: function(C) {
                var B = C || window.event;
                if (B.preventDefault) {
                    B.preventDefault()
                } else {
                    B.returnValue = false
                }
                return false
            },
            stopPropagation: function(C) {
                var B = C || window.event;
                if (B.stopPropagation) {
                    B.stopPropagation()
                } else {
                    B.cancelBubble = true
                }
            },
            GC: function() {
                if (A.Browser.ie) {
                    return function() {
                        for (var B in A.Event.observer) {
                            var C = A.Event.observer[B].src;
                            if (C && C.ownerDocument) {
                                try {
                                    !C.offsetParent && A.Event.stopObserving(B)
                                } catch (C) {
                                    A.Event.stopObserving(B)
                                }
                            }
                        }
                    }
                } else {
                    return function() {
                        for (var B in A.Event.observer) {
                            var D = A.Event.observer[B].src,
                                C = false;
                            if (D && D.ownerDocument) {
                                if (!D.offsetParent) {
                                    do {
                                        if (D === document.body) {
                                            C = true;
                                            break
                                        }
                                    } while (D = D.parentNode);
                                    !C && A.Event.stopObserving(B)
                                }
                            }
                        }
                    }
                }
            }
        },
        Function: {
            bind: function(E) {
                var F = E,
                    C = A.$A(arguments),
                    B, D;
                C.shift();
                B = C.shift();
                D = function() {
                    return F.apply(B, C.concat(A.$A(arguments)))
                };
                D.__Binded = true;
                return D
            },
            bindAsEventListener: function(E) {
                var F = E,
                    C = A.$A(arguments),
                    B, D;
                C.shift();
                B = C.shift();
                D = function(G) {
                    return F.apply(B, [G || window.event].concat(C))
                };
                D.__Binded = true;
                return D
            },
            interval: function(E, B, D) {
                var C = (D) ? A.Function.bind(E, D) : E;
                return window.setInterval(C, B)
            },
            timeout: function(E, B, D) {
                var C = (D) ? A.Function.bind(E, D) : E;
                return window.setTimeout(C, B)
            }
        },
        Fx: {},
        Number: {},
        Object: {
            isArray: function(B) {
                return (A.Object.getType(B) === "Array")
            },
            isBoolean: function(B) {
                return (A.Object.getType(B) === "Boolean")
            },
            isFunction: function(B) {
                return (A.Object.getType(B) === "Function")
            },
            isString: function(B) {
                return (A.Object.getType(B) === "String")
            },
            isNumber: function(B) {
                return (A.Object.getType(B) === "Number")
            },
            isObject: function(B) {
                return (A.Object.getType(B) === "Object")
            },
            getType: function(B) {
                return Object.prototype.toString.call(B).toString().match(/\[object\s(\w*)\]$/)[1]
            },
            toJSON: function(B) {
                return A.toJSON(B)
            }
        },
        String: {
            trim: function(B) {
                return B.replace(/^\s\s*/, "").replace(/\s\s*$/, "")
            },
            replaceAll: function() {
                return function(C, B, D) {
                    if (B.constructor == RegExp) {
                        return C.replace(new RegExp(B.toString().replace(/^\/|\/$/gi, ""), "gi"), D)
                    }
                    return C.split(B).join(D)
                }
            }(),
            byteLength: function(C) {
                var B = 0;
                A.$A(C.toString()).each(function(D) {
                    B += (escape(D).length > 3) ? 2 : 1
                });
                return B
            },
            cutString: function(E, B, D) {
                var G = D || "",
                    F = B - G.length,
                    I = 0,
                    H = "",
                    C;
                A.$A(E.toString()).each(function(J) {
                    C = (escape(J).length > 3) ? 2 : 1;
                    I += C;
                    F -= C;
                    if (F >= 0) {
                        H += J
                    }
                });
                return (B >= I) ? E : H += G
            }
        },
        $: function(B) {
            return typeof B == "string" ? document.getElementById(B) : B
        },
        $A: function(C) {
            if (!C) {
                return []
            }
            if (C instanceof Array && !A.Browser.op) {
                return C
            }
            var D = (typeof C == "string" && (A.ie || A.op)) ? C.split("") : C,
                B;
            try {
                B = Array.prototype.slice.call(D)
            } catch (F) {
                B = [];
                for (var E = 0; E < C.length; E += 1) {
                    B.push(C[E])
                }
            }
            return B
        },
        $C: function(B, D) {
            var C = A.$(B);
            return (C !== null) ? A.Element.getElementsByClassName(C, D) : null
        },
        $E: function(C) {
            var B = A.$(C);
            if (B) {
                A.extendMethods(B, A.Element, false);
                B.addEvent = A.methodize(A.Event.addEvent);
                B.removeEvent = A.methodize(A.Event.removeEvent)
            }
            return B
        },
        $F: function(D) {
            var E = A.$(D) || document.getElementsByName(D)[0],
                C, F, B;
            if (!E || (E.tagName !== "INPUT" && E.tagName !== "SELECT" && E.tagName !== "TEXTAREA")) {
                return ""
            }
            if (E.type == "radio" || E.type == "checkbox") {
                for (C = 0, F = document.getElementsByName(E.name), B = new Array(); C < F.length; C += 1) {
                    if (F[C].checked) {
                        B.push(F[C].value)
                    }
                }
                B = (E.type == "radio") ? B[0] : B
            } else {
                if (E.type == "select-multiple") {
                    for (C = 0, F = A.Element.getChildElements(E), B = new Array(); C < F.length; C += 1) {
                        if (F[C].selected) {
                            B.push(F[C].value)
                        }
                    }
                } else {
                    if (E.value) {
                        B = E.value
                    }
                }
            }
            return B
        },
        $T: function(B, C) {
            return (C || document).getElementsByTagName(B)
        },
        activeX: function() {
            return function(K, D, C) {
                var O = new Date(),
                    F = C || false,
                    N = O.getMinutes().toString() + O.getSeconds() + O.getMilliseconds(),
                    I = K.param,
                    J, M, H = false,
                    B = null,
                    L = "<object ",
                    G, E;
                L += 'id="' + ((!K.id) ? "daumActiveX" + N + '" ' : K.id + '" ');
                L += 'name="' + ((!K.name) ? "daumActiveX" + N + '" ' : K.name + '" ');
                L += (K.type) ? 'type="' + K.type + '" ' : "";
                L += (K.classid) ? 'classid="' + K.classid + '" ' : "";
                L += (K.width) ? 'width="' + K.width + '" ' : "";
                L += (K.height) ? 'height="' + K.height + '" ' : "";
                L += (K.codebase) ? 'codebase="' + K.codebase + '" ' : "";
                L += ">\r\n";
                for (J in I) {
                    if (I.hasOwnProperty(J)) {
                        L += '<param name="' + J + '" value="' + I[J] + '" />\r\n'
                    }
                }
                L += "<embed ";
                L += 'id="' + ((!K.id) ? "daumActiveX" + N + '" ' : K.id + '" ');
                L += 'name="' + ((!K.name) ? "daumActiveX" + N + '" ' : K.name + '" ');
                L += (K.type) ? 'type="' + K.type + '" ' : "";
                L += (K.width) ? 'width="' + K.width + '" ' : "";
                L += (K.height) ? 'height="' + K.height + '" ' : "";
                for (J in I) {
                    if (I.hasOwnProperty(J)) {
                        M = J.toLowerCase();
                        if (M) {
                            if (M == "movie" || M == "src") {
                                B = I[J]
                            }
                            if (M != "flashvars") {
                                L += M + '="' + I[J] + '" '
                            } else {
                                H = I[J]
                            }
                        }
                    }
                }
                L += " />\r\n</object>\r\n";
                if ( !! H && !! B) {
                    L = L.replace('src="' + B + '"', 'src="' + B + (B.indexOf("?") == -1 ? "?" : "&") + H + '"')
                }
                if (!F) {
                    G = A.$(D);
                    if (A.Browser.ie || K.type == "application/x-shockwave-flash" || K.classid.toLowerCase() == "clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" || (A.Browser.win && K.classid.toLowerCase() == "clsid:22d6f312-b0f6-11d0-94ab-0080c74c7e95")) {
                        if (!F) {
                            G.innerHTML = L
                        }
                    }
                    E = A.Element.getFirstChild(G);
                    return (A.Browser.ie) ? E : E.getElementsByTagName("embed")[0]
                } else {
                    return L
                }
            }
        }(),
        documentLoaded: false,
        extendMethods: function(D, E, C) {
            var B = C !== undefined ? C : true,
                F;
            for (F in E) {
                if (!D[F] || B) {
                    if (typeof(E[F]) == "function") {
                        D[F] = A.methodize(E[F])
                    }
                }
            }
            return D
        },
        methodize: function(B) {
            return function() {
                return B.apply(null, [this].concat(A.$A(arguments)))
            }
        },
        nativeExtend: function() {
            var B = [
                [A.Object, Object],
                [A.String, String.prototype],
                [A.Number, Number.prototype],
                [A.Array, Array.prototype],
                [A.Function, Function.prototype]
            ],
                C;
            Array.prototype.isArray = true;
            Number.prototype.isNumber = true;
            String.prototype.isString = true;
            Function.prototype.isFunction = true;
            for (C = 0; C < B.length; C += 1) {
                A.extendMethods(B[C][1], B[C][0], false)
            }
        },
        random: function(C, B) {
            return Math.floor(Math.random() * (B - C + 1) + C)
        },
        showFlash: function(G, E, C, H, B) {
            var D = {
                quality: "high",
                wmode: "transparent",
                bgcolor: "#FFFFFF",
                pluginspace: "http://www.macromedia.com/go/getflashplayer",
                allowScriptAccess: "always",
                allowFullScreen: "true",
                htmltext: false
            },
                F = {
                    type: "application/x-shockwave-flash",
                    classid: "clsid:d27cdb6e-ae6d-11cf-96b8-444553540000",
                    codebase: "http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0",
                    wmode: "transparent",
                    width: E,
                    height: C,
                    param: {
                        movie: G,
                        src: G
                    }
                };
            A.extend(D, B || {});
            A.extend(F.param, D);
            if (location.toString().indexOf("https://") != -1) {
                F.codebase = F.codebase.replace("http://", "https://")
            }
            return A.activeX(F, H, D.htmltext)
        }
    })
})();
(function() {
    daum.Browser.browserInit();
    if (!document.getElementsByClassName) {
        document.getElementsByClassName = daum.methodize(daum.Element.getElementsByClassName)
    }
    if (String.prototype.trim) {
        daum.String.trim = function(A) {
            return A.trim()
        }
    }
    return true
})();
daum.extend(daum, {
    createElement: function(F, E) {
        var J, A = "",
            H = daum.HTMLStack,
            D, B, G, I;
        if (!E) {
            J = daum.String.startsWith(F, "<") ? F : ("<" + F + "></" + F + ">")
        } else {
            for (i in E) {
                A += i + '="' + E[i] + '" '
            }
            J = "<" + F + " " + A + "></" + F + ">"
        }
        try {
            H.innerHTML = J;
            D = H.removeChild(H.firstChild);
            if (D.nodeType !== 1) {
                throw ({
                    message: "shit browser!"
                })
            } else {
                return D
            }
        } catch (C) {
            B = J.match(/\w+/).toString().toLowerCase();
            G = {
                tbody: ["<table>", "</table>"],
                tr: ["<table><tbody>", "</tbody></table>"],
                td: ["<table><tbody><tr>", "</tr></tbody></table>"],
                option: ["<select>", "</select>"]
            };
            if (G[B]) {
                H.innerHTML = G[B][0] + J + G[B][1];
                I = H.removeChild(H.firstChild);
                return I.getElementsByTagName(B)[0]
            } else {
                return document.createElement(J)
            }
        }
    },
    loadedScripts: {},
    loadTimer: {},
    load: function(E, A, B) {
        if (daum.loadedScripts[E]) {
            if (A) {
                A()
            }
            return false
        }
        var C, D;
        C = document.createElement("script");
        C.type = "text/javascript";
        for (D in B) {
            if (B.hasOwnProperty(D)) {
                C.setAttribute(D, B[D])
            }
        }
        C.src = E;
        daum.$T("head")[0].appendChild(C);
        if (!A) {
            return false
        }
        C.onreadystatechange = function() {
            if (this.readyState == "loaded" || this.readyState == "complete") {
                if (!daum.loadedScripts[E]) {
                    daum.loadedScripts[E] = true;
                    A()
                }
            }
            return
        };
        C.onload = function() {
            if (!daum.loadedScripts[E]) {
                daum.loadedScripts[E] = true;
                A()
            }
            return
        };
        return true
    },
    urlParameter: function() {
        var D = {},
            C = [],
            B, A = location.search.substr(1).split("&");
        for (B = 0; B < A.length; B += 1) {
            C = A[B].split("=");
            D[C[0]] = C[1]
        }
        return D
    }(),
    getParam: function(A) {
        return this.urlParameter[A] || null
    },
    useHTMLPrototype: function() {
        daum.HTMLFragment = (document.createDocumentFragment) ? document.createDocumentFragment() : document.createElement("div");
        daum.HTMLPrototype = document.createElement("div");
        daum.HTMLStack = document.createElement("div");
        daum.HTMLPrototype.id = "daum_html_prototype";
        daum.HTMLStack.id = "daum_html_stack";
        daum.HTMLFragment.appendChild(daum.HTMLPrototype);
        daum.HTMLFragment.appendChild(daum.HTMLStack);
        daum.HTMLPrototype.style.position = daum.HTMLStack.style.position = "absolute";
        daum.HTMLPrototype.style.left = daum.HTMLStack.style.left = daum.HTMLPrototype.style.top = daum.HTMLStack.style.top = "-10000px";
        return true
    }(),
    toJSON: function(A) {
        return JSON.stringify(A)
    },
    xmlToObject: function(C) {
        var A = C.documentElement,
            B = function(G) {
                var I = {},
                    J = daum.getChildElements(G),
                    E, H;
                for (var F = 0; F < J.length; F += 1) {
                    E = J[F].nodeName;
                    H = (daum.getChildElements(J[F]).length > 0) ? B(J[F]) : (J[F].firstChild == null) ? "" : J[F].firstChild.nodeValue;
                    if (I[E] != undefined || G.getElementsByTagName(E).length > 1) {
                        if (I[E] == undefined) {
                            I[E] = []
                        }
                        I[E].push(H)
                    } else {
                        I[E] = H
                    }
                    for (var D = 0; D < J[F].attributes.length; D += 1) {
                        I[E + "@" + J[F].attributes[D].nodeName] = (J[F].attributes[D].nodeValue || "").toString()
                    }
                }
                return I
            };
        return B(A)
    },
    jsonToObject: function(A) {
        return JSON.parse(A)
    }
});
daum.extend(daum.Array, {
    copy: function(A) {
        var D = [],
            B, C;
        for (B = 0; B < A.length; B++) {
            if (A[B].constructor == A.constructor) {
                D[B] = daum.Array.copy(A[B])
            } else {
                if (typeof(A[B]) == "object") {
                    if (typeof(A[B].valueOf()) == "object") {
                        D[B] = A[B].constructor();
                        for (C in A[B]) {
                            D[B][C] = A[B][C]
                        }
                    } else {
                        D[B] = A[B].constructor(A[B].valueOf())
                    }
                } else {
                    D[B] = A[B]
                }
            }
        }
        return D
    },
    map: function(B, D) {
        if (typeof Array.prototype.map === "function" && Array.prototype.map.toString().indexOf("native") > 0) {
            return B.map(D)
        }
        for (var A = [], C = 0, E = B.length; C < E; ++C) {
            A[C] = D(B[C], C)
        }
        return A
    },
    size: function(A) {
        return daum.Array.compact(A).length
    },
    uniq: function(A) {
        var B = [],
            C;
        for (C = 0; C < A.length; C++) {
            if (!daum.Array.contains(B, A[C])) {
                B.push(A[C])
            }
        }
        return B
    },
    getFirst: function(A) {
        return A[0]
    },
    getLast: function(A) {
        return A[A.length - 1]
    }
});
daum.extend(daum.Browser, {
    getWindowSize: function() {
        var A = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || 1003) - 2,
            B = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 650) - 2;
        return {
            width: A,
            height: B
        }
    },
    getScrollOffsets: function() {
        return {
            left: window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
            top: window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
        }
    },
    setCookie: function(C, D, A) {
        var E = new Date(),
            B = "";
        if (A) {
            E.setDate(E.getDate() + A);
            B = "expires=" + E.toGMTString() + ";"
        }
        document.cookie = C + "=" + escape(D) + "; path=/;" + B
    },
    getCookie: function(C) {
        var B = C + "=",
            D = document.cookie + ";",
            E = D.indexOf(B),
            A;
        if (E != -1) {
            A = D.indexOf(";", E);
            return unescape(D.substring(E + B.length, A))
        }
        return
    },
    delCookie: function(A) {
        document.cookie = A + "=;expires=Fri, 31 Dec 1987 23:59:59 GMT;"
    },
    setOffset: function() {
        var B = daum.Browser,
            A = oh = 0;
        if (B.ie_sv1) {
            A = 10;
            oh = (B.infopath) ? 58 : 29
        } else {
            if (B.ie7) {
                A = 10;
                oh = 81
            } else {
                if (B.etc) {
                    A = (B.mac) ? 0 : 6;
                    oh = (B.mac) ? 68 : 54
                } else {
                    if (B.ff2) {
                        A = (B.mac) ? 0 : 6;
                        oh = (B.mac) ? 18 : (B.infopath) ? 54 : 49
                    } else {
                        if (B.ff3) {
                            A = (B.mac) ? 0 : 8;
                            oh = (B.mac) ? 68 : (B.infopath) ? 85 : 75
                        } else {
                            if (B.sf) {
                                A = (B.mac) ? 0 : 4;
                                oh = (B.mac) ? 23 : 27
                            } else {
                                if (B.ns) {
                                    A = (B.mac) ? 0 : 6;
                                    oh = (B.mac) ? 18 : 54
                                } else {
                                    if (B.op) {
                                        A = (B.mac) ? 0 : 9;
                                        oh = (B.mac) ? 36 : 49
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        B.offset.width = A;
        B.offset.height = oh
    }(),
    resizePop: function(B, D) {
        var A = (typeof(B) == "object") ? B.offsetHeight : D,
            C = (typeof(B) == "object") ? B.offsetWidth : B;
        window.resizeTo(C + daum.Browser.offset.width, A + daum.Browser.offset.height)
    },
    popup: function(D, B, F, A) {
        var C = {
            name: "daumPopup",
            scroll: 0,
            resize: 0,
            status: 0
        },
            G, E = function(H) {
                return (H && H != "no") ? "yes" : "no"
            };
        daum.extend(C, A || {}, true);
        G = "width=" + B + ",height=" + F + ",status=" + E(C.status);
        G += ",resizable=" + E(C.resize) + ",scrollbars=" + E(C.scroll);
        return window.open(D, C.name, G)
    }
});
daum.extend(daum.Function, {
    callBack: function(E) {
        var D = E,
            B = daum.$A(arguments),
            C, A;
        B.shift();
        C = B.shift();
        return function() {
            B = B.concat(daum.$A(arguments));
            A = D.apply(null, B);
            C.apply(null, B);
            return A
        }
    },
    callFore: function(D) {
        var C = D,
            A = daum.$A(arguments),
            B;
        A.shift();
        B = A.shift();
        return function() {
            A = A.concat(daum.$A(arguments));
            B(A);
            return C(A)
        }
    },
    inherit: function(D, C, A) {
        var B = function() {},
            E;
        B.prototype = C.prototype;
        D.prototype = new B(), D.prototype.constructor = D;
        D.prototype.parent = (C.prototype.parent || []).concat(C);
        D._parent = C;
        E = D.prototype.parent.length;
        D.prototype.$super = function() {
            this.constructor.prototype.parent[--E].apply(this, arguments);
            E = E == 0 ? this.constructor.prototype.parent.length : E
        };
        if (A) {
            daum.Function.members(D, A)
        }
        return D
    },
    members: function(C, D) {
        var B, A = C._parent || C;
        for (var B in D) {
            C.prototype[B] = (typeof(D[B]) == "function") ? (A.prototype[B]) ? (function(E, F) {
                if (F.toString().indexOf("this.$super(") > -1) {
                    return function() {
                        this.$prev_super = this.$super;
                        this.$super = function() {
                            this.$super = this.$prev_super;
                            return A.prototype[E].apply(this, arguments)
                        };
                        return F.apply(this, arguments)
                    }
                }
                return function() {
                    return F.apply(this, arguments)
                }
            })(B, D[B]) : (function(E, F) {
                if (F.toString().indexOf("this.$super(") > -1) {
                    throw new Error(E + " function is not defined in " + C)
                }
                return function() {
                    return F.apply(this, arguments)
                }
            })(B, D[B]) : D[B]
        }
        return C
    },
    method: function(D, C, A) {
        var B = D._parent || D;
        D.prototype[C] = (typeof(A) == "function") ? (B.prototype[C]) ? (function(E, F) {
            return function() {
                this.$super = function() {
                    return B.prototype[E].apply(this, arguments)
                };
                return F.apply(this, arguments)
            }
        })(C, A) : (function(E, F) {
            return function() {
                this.$super = function() {
                    return true
                };
                return F.apply(this, arguments)
            }
        })(C, A) : A;
        return D
    }
});
daum.createFunction = function(D, A) {
    var C = "return function(",
        B;
    for (B = 0; B < D.length; B++) {
        C += "" + D[B] + ","
    }
    C = C.replace(/,$/, "");
    C = C + "){" + A + "}";
    return (new Function(C))()
};
daum.extend(daum.Fx, {
    running: {},
    parse: function(E, C, D) {
        if (C === "opacity" && daum.ie) {
            E = E === undefined ? 1 : E
        } else {
            if (E === "transparent" || E.startsWith("rgba")) {
                E = "rgb(255,255,255)"
            } else {
                if (E === "auto") {
                    E = daum.String.px(D["scroll" + C.charAt(0).toUpperCase() + C.substr(1)])
                }
            }
        }
        var A = parseFloat(E),
            B = E.toString().replace(/^\-?[\d\.]+/, "");
        return {
            value: isNaN(A) ? B : A,
            unit: isNaN(A) ? B.startsWith("rgb") || B.startsWith("#") ? "color" : "" : B
        }
    },
    normalize: function(A) {
        var H = {},
            G, I = (typeof A === "object") ? "" : A,
            C, F = document.createElement("div"),
            E = ("borderStyle backgroundColor borderBottomColor borderBottomWidth borderLeftColor borderLeftWidth borderRightColor borderRightWidth borderSpacing borderTopColor borderTopWidth bottom color fontSize fontWeight height left letterSpacing lineHeight marginBottom marginLeft marginRight marginTop maxHeight maxWidth minHeight minWidth opacity outlineColor outlineOffset outlineWidth paddingBottom paddingLeft paddingRight paddingTop right textIndent top width wordSpacing zIndex").split(" "),
            D = E.length,
            B;
        F.innerHTML = '<div style="' + I + '"></div>';
        C = F.childNodes[0];
        if ("" === I) {
            for (B in A) {
                C.style[B] = A[B].toString()
            }
        }
        while (D--) {
            if (G = C.style[E[D]]) {
                H[E[D]] = this.parse(G, E[D])
            }
        }
        return H
    },
    s: function(B, A, C) {
        return B.substr(A, C || 1)
    },
    stop: function(A, B) {
        clearInterval(this.running[A.id]);
        delete daum.Fx.running[A.id];
        B && B(A);
        A.id = A.id.toString().startsWith("__t") ? "" : A.id
    },
    color: function(B, F, H) {
        var D = 2,
            C, G, E, I = [],
            A = [];
        while (C = 3, G = arguments[D - 1], D--) {
            if (this.s(G, 0) === "r") {
                G = G.match(/\d+/g);
                while (C--) {
                    I.push(~~G[C])
                }
            } else {
                if (G.length === 4) {
                    G = "#" + this.s(G, 1) + this.s(G, 1) + this.s(G, 2) + this.s(G, 2) + this.s(G, 3) + this.s(G, 3)
                }
                while (C--) {
                    I.push(parseInt(this.s(G, 1 + C * 2, 2), 16))
                }
            }
        }
        while (C--) {
            E = ~~ (I[C + 3] + (I[C] - I[C + 3]) * H);
            A.push(E < 0 ? 0 : E > 255 ? 255 : E)
        }
        return "rgb(" + A.join(",") + ")"
    },
    animate: function(G, M, N) {
        var F = daum.$(G),
            A = N || {},
            J = this.normalize(M),
            H = F.currentStyle ? F.currentStyle : getComputedStyle(F, null),
            C, I = {},
            D = +new Date,
            B = (A.duration && A.duration <= 10 ? A.duration * 1000 : A.duration) || 700,
            L = D + B,
            E, K = A.easing ||
            function(P, O, R, Q) {
                return -R * (P /= Q) * (P - 2) + O
            };
        F.id = (!F.id) ? "__t" + +new Date + daum.random(1, 10000) : F.id;
        if (daum.ie6) {
            F.style.zoom = "1"
        }
        if (this.running[F.id]) {
            clearInterval(this.running[F.id]);
            delete daum.Fx.running[F.id]
        }
        for (C in J) {
            I[C] = this.parse(H[C], C, F)
        }
        if (daum.toJSON(I) === daum.toJSON(J)) {
            this.stop(F, A.callback);
            return
        }
        E = setInterval(function() {
            var P = +new Date;
            for (C in J) {
                try {
                    F.style[C] = J[C].unit === "color" ? daum.Fx.color(I[C].value, J[C].value, K(P - D, 0, 1, B)) : K(P - D, I[C].value, J[C].value - I[C].value, B).toFixed(3) + J[C].unit
                } catch (O) {
                    F.style[C] = J[C].value;
                    delete J[C]
                }
                if (C === "opacity" && daum.ie) {
                    F.style.filter = "alpha(opacity=" + F.style[C] * 100 + ")"
                }
            }
            if (P > L) {
                for (C in J) {
                    F.style[C] = J[C].unit === "color" ? daum.Fx.color(I[C].value, J[C].value, 1) : J[C].value + J[C].unit
                }
                this.stop(F, A.callback)
            }
        }.bind(this), 13);
        this.running[F.id] = E
    },
    scrollTo: function(E, K) {
        var D = daum.$E(E),
            A = K || {},
            F = (daum.ie) ? document.documentElement.scrollTop : window.pageYOffset,
            C = +new Date,
            H = D.getCoords()["top"] + ((A.offset) ? A.offset : 0),
            B = A.duration || 700,
            I = C + B,
            G = A.easing ||
            function(M, L, O, N) {
                return -O * (M /= N) * (M - 2) + L
            },
            J = setInterval(function() {
                var L = +new Date;
                window.scrollTo(0, G(L - C, F, H - F, B));
                if (L > I) {
                    window.scrollTo(0, H);
                    clearInterval(J)
                }
            }, 13)
    }
});
daum.extend(daum.Element, {
    setLeft: function(A, C, B) {
        return daum.Element.setStyleProperty(A, "left", C, B)
    },
    setTop: function(A, C, B) {
        return daum.Element.setStyleProperty(A, "top", C, B)
    },
    setWidth: function(B, A, C) {
        return daum.Element.setStyleProperty(B, "width", A, C)
    },
    setHeight: function(B, A, C) {
        return daum.Element.setStyleProperty(B, "height", A, C)
    },
    setPosition: function(A, C, D, B) {
        daum.Element.setStyleProperty(A, "left", C, B);
        return daum.Element.setStyleProperty(A, "top", D, B)
    },
    setSize: function(C, A, B, D) {
        daum.Element.setStyleProperty(C, "width", A, D);
        return daum.Element.setStyleProperty(C, "height", B, D)
    },
    setStyleProperty: function(B, A, F, D) {
        var E = daum.$(B),
            C;
        if (D || false) {
            C = (isNaN(parseInt(E.style[A]))) ? parseInt(E["offset" + (A.replace(/^(.)/g, function(H, G) {
                return G.toUpperCase()
            }))]) + F : parseInt(E.style[A]) + F
        } else {
            C = F
        }
        E.style[A] = daum.String.px(C);
        return E
    },
    setLeftByOffset: function(A, B) {
        return daum.Element.setLeft(A, B, true)
    },
    setTopByOffset: function(A, B) {
        return daum.Element.setTop(A, B, true)
    },
    setWidthByOffset: function(A, B) {
        return daum.Element.setWidth(A, B, true)
    },
    setHeightByOffset: function(A, B) {
        return daum.Element.setHeight(A, B, true)
    },
    setPositionByOffset: function(B, A, C) {
        return daum.Element.setPosition(B, A, C, true)
    },
    setSizeByOffset: function(B, A, C) {
        return daum.Element.setSize(B, A, C, true)
    },
    posHide: function(A) {
        var B = daum.$(A);
        daum.Element.setPosition(B, -10000, -10000);
        return B
    },
    setCssText: function() {
        return (daum.Browser.ie) ?
        function(B, A) {
            B.style.cssText = A
        } : function(B, A) {
            B.setAttribute("style", A)
        }
    }(),
    setPngOpacity: function() {
        if (daum.Browser.ie6) {
            return function(A, C, D) {
                var B = daum.$(A);
                B.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="' + C + '", sizingMethod="' + (D || "image") + '")';
                if (B.style.background != "") {
                    B.style.background = "none"
                }
                if (B.tagName.toLowerCase() == "img") {
                    B.src = "http://imap.daum-img.net/defaultimg/transparent.gif"
                }
            }
        } else {
            return function(B, D, E) {
                var A = (E == "scale") ? "repeat" : "no-repeat",
                    C = daum.$(B);
                if (C.tagName.toLowerCase() != "img") {
                    C.style.background = "url(" + D + ") " + A
                } else {
                    C.src = D
                }
            }
        }
    }(),
    setStyle: function(C, D, B) {
        if (B) {
            return daum.Element.setStyleProperty(C, D, B, false)
        }
        var F = daum.$(C),
            A = F.style,
            E;
        if (D.length < 1) {
            return F
        }
        if (daum.Object.isString(D)) {
            A.cssText += ";" + D
        } else {
            if (daum.Object.isObject(D)) {
                for (E in D) {
                    A[(E == "float" || E == "cssFloat") ? (undefined == A.styleFloat ? "cssFloat" : "styleFloat") : E] = D[E]
                }
            }
        }
        return F
    },
    destroy: function(B) {
        var A = "__daumGB",
            D = daum.$(A),
            C = daum.$(B);
        if (C.id === A) {
            return
        }
        if (!D) {
            D = daum.createElement("div", {
                id: A,
                style: "display:none;"
            });
            document.body.appendChild(D)
        }
        D.appendChild(C);
        D.innerHTML = "";
        C = null
    }
});
daum.extend(daum.Event, {
    getWheel: function(A) {
        var B = A || window.event,
            C = 0;
        if (B.wheelDelta) {
            C = B.wheelDelta / 120
        } else {
            if (B.detail) {
                C = -B.detail / 3
            }
        }
        return C
    },
    getMouseButton: function(B) {
        var C = B || window.event,
            A = C.button;
        return {
            left: (daum.Browser.ie) ? A === 1 : A === 0,
            middle: (daum.Browser.ie) ? A === 4 : A === 1,
            right: A == 2
        }
    },
    getElement: function(A) {
        var B = A || window.event;
        return B.srcElement || B.target
    }
});
daum.extend(daum.Number, {
    px: function(A) {
        return daum.String.px(A)
    },
    fillZero: function(D, A) {
        var C = A || 0,
            B = D.toString();
        if (C < B.length) {
            return B
        }
        while (B.length < C) {
            B = "0" + B
        }
        return B
    },
    toInt: function(B, A) {
        return daum.String.toInt(B, A)
    },
    toFloat: function(A) {
        return daum.String.toFloat(A)
    }
});
daum.extend(daum.String, {
    empty: function(A) {
        return daum.String.isEmpty(A)
    },
    isEmpty: function(A) {
        return (!A || A.length === 0)
    },
    px: function(B) {
        var A = parseInt(B);
        return (!isNaN(A)) ? A + "px" : B
    },
    removeCR: function(A) {
        return (A) ? daum.String.replaceAll(A, /\n|\r/, "") : null
    },
    toInt: function(B, A) {
        return parseInt(B, A || 10)
    },
    toFloat: function(A) {
        return parseFloat(A)
    },
    startWith: function(B, A) {
        return daum.String.startsWith(B, A)
    },
    startsWith: function(B, A) {
        return B.indexOf(A) === 0
    },
    endWith: function(B, A) {
        return daum.String.endsWith(B, A)
    },
    endsWith: function(B, C) {
        var A;
        return (A = B.length - C.length) >= 0 && B.lastIndexOf(C) === A
    },
    cutPixel: function(C, F, E) {
        if (!daum.documentLoaded) {
            return false
        }
        var A = E || "",
            D, G, B;
        document.body.appendChild(daum.HTMLPrototype);
        daum.HTMLPrototype.innerHTML = A;
        D = daum.HTMLPrototype.offsetWidth;
        F -= D;
        daum.HTMLPrototype.innerHTML = "";
        G = [];
        for (B = 0; B < C.length; B += 1) {
            daum.HTMLPrototype.innerHTML += C.charAt(B);
            if (F > daum.HTMLPrototype.offsetWidth) {
                G.push(C.charAt(B))
            } else {
                G.push(A);
                break
            }
        }
        daum.HTMLFragment.appendChild(daum.HTMLPrototype);
        return G.join("")
    },
    escape: function(B, A) {
        return (A) ? daum.String.escapeHTML(B) : daum.String.unescapeHTML(B)
    },
    escapeHTML: function(A) {
        return A.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;")
    },
    unescapeHTML: function(A) {
        return daum.String.stripTags(A).replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    },
    toHTML: function(A) {
        return daum.String.unescapeHTML(A)
    },
    stripTags: function(A) {
        return A.replace(/<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?>|<\/\w+>/gi, "")
    },
    stripTag: function(A) {
        return daum.String.stripTags(A)
    }
});
daum.Ajax = function(A) {
    this.options = {
        url: "",
        method: "get",
        async: true,
        timeout: 5000,
        paramString: "",
        encoding: "utf-8",
        onsuccess: function() {},
        onfailure: function() {},
        onloading: function() {},
        ontimeout: function() {},
        headers: {},
        link: "ignore"
    };
    daum.extend(this.options, A || {});
    this.init()
};
daum.Ajax.prototype = {
    init: function() {
        if (window.XMLHttpRequest) {
            this.XHR = new XMLHttpRequest()
        } else {
            if (window.ActiveXObject) {
                try {
                    this.XHR = new ActiveXObject("Msxml2.XMLHTTP")
                } catch (A) {
                    try {
                        this.XHR = new ActiveXObject("Microsoft.XMLHTTP")
                    } catch (A) {
                        this.XHR = null
                    }
                }
            }
        }
        if (!this.XHR) {
            return false
        }
        this.running = false
    },
    request: function(C, B) {
        if (this.running) {
            if (this.options.link === "cancel") {
                this.abort()
            } else {
                return
            }
        }
        this.setOptions(B);
        var A = C || this.options.url;
        if (this.options.paramString.length > 0 && this.options.method == "get") {
            A = A + ((A.indexOf("?") > 0) ? "&" : "?") + this.options.paramString
        }
        this.open(A)
    },
    open: function(B) {
        this.running = true;
        if (this.options.async) {
            this.XHR.onreadystatechange = daum.Function.bindAsEventListener(this.stateHandle, this)
        }
        this.options.timer = daum.Function.timeout(this.abort, this.options.timeout, this);
        this.XHR.open(this.options.method, B, this.options.async);
        var C = this.options.headers;
        for (var A in C) {
            this.XHR.setRequestHeader(A, C[A])
        }
        this.XHR.send(this.options.paramString);
        if (!this.options.async) {
            this.stateHandle()
        }
    },
    abort: function() {
        if (this.XHR) {
            this.XHR.abort();
            this.callTimeout();
            this.running = false
        }
    },
    stateHandle: function(A) {
        switch (this.XHR.readyState) {
        case 4:
            window.clearTimeout(this.options.timer);
            this.options.timer = null;
            if (this.XHR.status == 200 || this.XHR.status == 304) {
                this.callSuccess()
            } else {
                if (this.XHR.status >= 400) {
                    this.callFailure(this.XHR.status)
                }
            }
            this.running = false;
            break;
        case 1:
            this.callLoading();
            break
        }
    },
    callSuccess: function() {
        this.options.onsuccess(this.XHR)
    },
    callFailure: function() {
        this.options.onfailure(this.XHR)
    },
    callLoading: function() {
        this.options.onloading(this.XHR)
    },
    callTimeout: function() {
        this.options.ontimeout(this.XHR)
    },
    setOptions: function(A) {
        daum.extend(this.options, A || {});
        this.options.method = this.options.method.toLowerCase();
        this.setHeader("charset", this.options.encoding);
        if (this.options.method == "post") {
            this.setHeader("Content-Type", "application/x-www-form-urlencoded")
        }
    },
    setHeader: function(A, B) {
        if (typeof A === "object") {
            daum.extend(this.options.headers, A || {}, true)
        } else {
            this.options.headers[A] = B
        }
        return this
    },
    getHeader: function(A) {
        return this.XHR.getResponseHeader(A)
    }
};
daum.Ajax.xmlToObject = function(A) {
    return daum.xmlToObject(A)
};
daum.Ajax.jsonToObject = function(A) {
    return daum.jsonToObject(A)
};
daum.Template = function(A) {
    this.template = A
};
daum.Template.prototype = {
    evaluate: function(A) {
        return this.template.replace(/#\{([A-Z_][\dA-Z_]*(?:\.[A-Z_][\dA-Z_]*)*)?\}/ig, function(D, E) {
            var B = E ? E.split(".") : "";
            var C = A || "";
            while (B.length) {
                C = C[B.shift()];
                if (C === undefined || C === null) {
                    return ""
                }
            }
            return C
        })
    },
    toElement: function(A) {
        return daum.createElement(this.evaluate(A))
    }
};
/*
 * Sizzle CSS Selector Engine - v1.0
 *  Copyright 2009, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function() {
    var O = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^[\]]*\]|['"][^'"]*['"]|[^[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?/g,
        H = 0,
        D = Object.prototype.toString,
        M = false;
    var B = function(d, T, a, V) {
        a = a || [];
        var Q = T = T || document;
        if (T.nodeType !== 1 && T.nodeType !== 9) {
            return []
        }
        if (!d || typeof d !== "string") {
            return a
        }
        var b = [],
            c, Y, g, f, Z, S, R = true,
            W = N(T);
        O.lastIndex = 0;
        while ((c = O.exec(d)) !== null) {
            b.push(c[1]);
            if (c[2]) {
                S = RegExp.rightContext;
                break
            }
        }
        if (b.length > 1 && I.exec(d)) {
            if (b.length === 2 && E.relative[b[0]]) {
                Y = F(b[0] + b[1], T)
            } else {
                Y = E.relative[b[0]] ? [T] : B(b.shift(), T);
                while (b.length) {
                    d = b.shift();
                    if (E.relative[d]) {
                        d += b.shift()
                    }
                    Y = F(d, Y)
                }
            }
        } else {
            if (!V && b.length > 1 && T.nodeType === 9 && !W && E.match.ID.test(b[0]) && !E.match.ID.test(b[b.length - 1])) {
                var h = B.find(b.shift(), T, W);
                T = h.expr ? B.filter(h.expr, h.set)[0] : h.set[0]
            }
            if (T) {
                var h = V ? {
                    expr: b.pop(),
                    set: A(V)
                } : B.find(b.pop(), b.length === 1 && (b[0] === "~" || b[0] === "+") && T.parentNode ? T.parentNode : T, W);
                Y = h.expr ? B.filter(h.expr, h.set) : h.set;
                if (b.length > 0) {
                    g = A(Y)
                } else {
                    R = false
                }
                while (b.length) {
                    var U = b.pop(),
                        X = U;
                    if (!E.relative[U]) {
                        U = ""
                    } else {
                        X = b.pop()
                    }
                    if (X == null) {
                        X = T
                    }
                    E.relative[U](g, X, W)
                }
            } else {
                g = b = []
            }
        }
        if (!g) {
            g = Y
        }
        if (!g) {
            throw "Syntax error, unrecognized expression: " + (U || d)
        }
        if (D.call(g) === "[object Array]") {
            if (!R) {
                a.push.apply(a, g)
            } else {
                if (T && T.nodeType === 1) {
                    for (var e = 0; g[e] != null; e++) {
                        if (g[e] && (g[e] === true || g[e].nodeType === 1 && G(T, g[e]))) {
                            a.push(Y[e])
                        }
                    }
                } else {
                    for (var e = 0; g[e] != null; e++) {
                        if (g[e] && g[e].nodeType === 1) {
                            a.push(Y[e])
                        }
                    }
                }
            }
        } else {
            A(g, a)
        }
        if (S) {
            B(S, Q, a, V);
            B.uniqueSort(a)
        }
        return a
    };
    B.uniqueSort = function(R) {
        if (C) {
            M = false;
            R.sort(C);
            if (M) {
                for (var Q = 1; Q < R.length; Q++) {
                    if (R[Q] === R[Q - 1]) {
                        R.splice(Q--, 1)
                    }
                }
            }
        }
        return R
    };
    B.matches = function(Q, R) {
        return B(Q, null, null, R)
    };
    B.find = function(X, Q, Y) {
        var W, U;
        if (!X) {
            return []
        }
        for (var T = 0, S = E.order.length; T < S; T++) {
            var V = E.order[T],
                U;
            if ((U = E.match[V].exec(X))) {
                var R = RegExp.leftContext;
                if (R.substr(R.length - 1) !== "\\") {
                    U[1] = (U[1] || "").replace(/\\/g, "");
                    W = E.find[V](U, Q, Y);
                    if (W != null) {
                        X = X.replace(E.match[V], "");
                        break
                    }
                }
            }
        }
        if (!W) {
            W = Q.getElementsByTagName("*")
        }
        return {
            set: W,
            expr: X
        }
    };
    B.filter = function(a, Z, d, T) {
        var S = a,
            f = [],
            X = Z,
            V, Q, W = Z && Z[0] && N(Z[0]);
        while (a && Z.length) {
            for (var Y in E.filter) {
                if ((V = E.match[Y].exec(a)) != null) {
                    var R = E.filter[Y],
                        e, c;
                    Q = false;
                    if (X == f) {
                        f = []
                    }
                    if (E.preFilter[Y]) {
                        V = E.preFilter[Y](V, X, d, f, T, W);
                        if (!V) {
                            Q = e = true
                        } else {
                            if (V === true) {
                                continue
                            }
                        }
                    }
                    if (V) {
                        for (var U = 0;
                        (c = X[U]) != null; U++) {
                            if (c) {
                                e = R(c, V, U, X);
                                var b = T ^ !! e;
                                if (d && e != null) {
                                    if (b) {
                                        Q = true
                                    } else {
                                        X[U] = false
                                    }
                                } else {
                                    if (b) {
                                        f.push(c);
                                        Q = true
                                    }
                                }
                            }
                        }
                    }
                    if (e !== undefined) {
                        if (!d) {
                            X = f
                        }
                        a = a.replace(E.match[Y], "");
                        if (!Q) {
                            return []
                        }
                        break
                    }
                }
            }
            if (a == S) {
                if (Q == null) {
                    throw "Syntax error, unrecognized expression: " + a
                } else {
                    break
                }
            }
            S = a
        }
        return X
    };
    var E = B.selectors = {
        order: ["ID", "NAME", "TAG"],
        match: {
            ID: /#((?:[\w\u00c0-\uFFFF-]|\\.)+)/,
            CLASS: /\.((?:[\w\u00c0-\uFFFF-]|\\.)+)/,
            NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF-]|\\.)+)['"]*\]/,
            ATTR: /\[\s*((?:[\w\u00c0-\uFFFF-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,
            TAG: /^((?:[\w\u00c0-\uFFFF\*-]|\\.)+)/,
            CHILD: /:(only|nth|last|first)-child(?:\((even|odd|[\dn+-]*)\))?/,
            POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^-]|$)/,
            PSEUDO: /:((?:[\w\u00c0-\uFFFF-]|\\.)+)(?:\((['"]*)((?:\([^\)]+\)|[^\2\(\)]*)+)\2\))?/
        },
        attrMap: {
            "class": "className",
            "for": "htmlFor"
        },
        attrHandle: {
            href: function(Q) {
                return Q.getAttribute("href")
            }
        },
        relative: {
            "+": function(X, Q, W) {
                var U = typeof Q === "string",
                    Y = U && !/\W/.test(Q),
                    V = U && !Y;
                if (Y && !W) {
                    Q = Q.toUpperCase()
                }
                for (var T = 0, S = X.length, R; T < S; T++) {
                    if ((R = X[T])) {
                        while ((R = R.previousSibling) && R.nodeType !== 1) {}
                        X[T] = V || R && R.nodeName === Q ? R || false : R === Q
                    }
                }
                if (V) {
                    B.filter(Q, X, true)
                }
            },
            ">": function(W, R, X) {
                var U = typeof R === "string";
                if (U && !/\W/.test(R)) {
                    R = X ? R : R.toUpperCase();
                    for (var S = 0, Q = W.length; S < Q; S++) {
                        var V = W[S];
                        if (V) {
                            var T = V.parentNode;
                            W[S] = T.nodeName === R ? T : false
                        }
                    }
                } else {
                    for (var S = 0, Q = W.length; S < Q; S++) {
                        var V = W[S];
                        if (V) {
                            W[S] = U ? V.parentNode : V.parentNode === R
                        }
                    }
                    if (U) {
                        B.filter(R, W, true)
                    }
                }
            },
            "": function(T, R, V) {
                var S = H++,
                    Q = P;
                if (!/\W/.test(R)) {
                    var U = R = V ? R : R.toUpperCase();
                    Q = L
                }
                Q("parentNode", R, S, T, U, V)
            },
            "~": function(T, R, V) {
                var S = H++,
                    Q = P;
                if (typeof R === "string" && !/\W/.test(R)) {
                    var U = R = V ? R : R.toUpperCase();
                    Q = L
                }
                Q("previousSibling", R, S, T, U, V)
            }
        },
        find: {
            ID: function(R, S, T) {
                if (typeof S.getElementById !== "undefined" && !T) {
                    var Q = S.getElementById(R[1]);
                    return Q ? [Q] : []
                }
            },
            NAME: function(S, V, W) {
                if (typeof V.getElementsByName !== "undefined") {
                    var R = [],
                        U = V.getElementsByName(S[1]);
                    for (var T = 0, Q = U.length; T < Q; T++) {
                        if (U[T].getAttribute("name") === S[1]) {
                            R.push(U[T])
                        }
                    }
                    return R.length === 0 ? null : R
                }
            },
            TAG: function(Q, R) {
                return R.getElementsByTagName(Q[1])
            }
        },
        preFilter: {
            CLASS: function(T, R, S, Q, W, X) {
                T = " " + T[1].replace(/\\/g, "") + " ";
                if (X) {
                    return T
                }
                for (var U = 0, V;
                (V = R[U]) != null; U++) {
                    if (V) {
                        if (W ^ (V.className && (" " + V.className + " ").indexOf(T) >= 0)) {
                            if (!S) {
                                Q.push(V)
                            }
                        } else {
                            if (S) {
                                R[U] = false
                            }
                        }
                    }
                }
                return false
            },
            ID: function(Q) {
                return Q[1].replace(/\\/g, "")
            },
            TAG: function(R, Q) {
                for (var S = 0; Q[S] === false; S++) {}
                return Q[S] && N(Q[S]) ? R[1] : R[1].toUpperCase()
            },
            CHILD: function(Q) {
                if (Q[1] == "nth") {
                    var R = /(-?)(\d*)n((?:\+|-)?\d*)/.exec(Q[2] == "even" && "2n" || Q[2] == "odd" && "2n+1" || !/\D/.test(Q[2]) && "0n+" + Q[2] || Q[2]);
                    Q[2] = (R[1] + (R[2] || 1)) - 0;
                    Q[3] = R[3] - 0
                }
                Q[0] = H++;
                return Q
            },
            ATTR: function(U, R, S, Q, V, W) {
                var T = U[1].replace(/\\/g, "");
                if (!W && E.attrMap[T]) {
                    U[1] = E.attrMap[T]
                }
                if (U[2] === "~=") {
                    U[4] = " " + U[4] + " "
                }
                return U
            },
            PSEUDO: function(U, R, S, Q, V) {
                if (U[1] === "not") {
                    if (O.exec(U[3]).length > 1 || /^\w/.test(U[3])) {
                        U[3] = B(U[3], null, null, R)
                    } else {
                        var T = B.filter(U[3], R, S, true ^ V);
                        if (!S) {
                            Q.push.apply(Q, T)
                        }
                        return false
                    }
                } else {
                    if (E.match.POS.test(U[0]) || E.match.CHILD.test(U[0])) {
                        return true
                    }
                }
                return U
            },
            POS: function(Q) {
                Q.unshift(true);
                return Q
            }
        },
        filters: {
            enabled: function(Q) {
                return Q.disabled === false && Q.type !== "hidden"
            },
            disabled: function(Q) {
                return Q.disabled === true
            },
            checked: function(Q) {
                return Q.checked === true
            },
            selected: function(Q) {
                Q.parentNode.selectedIndex;
                return Q.selected === true
            },
            parent: function(Q) {
                return !!Q.firstChild
            },
            empty: function(Q) {
                return !Q.firstChild
            },
            has: function(S, R, Q) {
                return !!B(Q[3], S).length
            },
            header: function(Q) {
                return /h\d/i.test(Q.nodeName)
            },
            text: function(Q) {
                return "text" === Q.type
            },
            radio: function(Q) {
                return "radio" === Q.type
            },
            checkbox: function(Q) {
                return "checkbox" === Q.type
            },
            file: function(Q) {
                return "file" === Q.type
            },
            password: function(Q) {
                return "password" === Q.type
            },
            submit: function(Q) {
                return "submit" === Q.type
            },
            image: function(Q) {
                return "image" === Q.type
            },
            reset: function(Q) {
                return "reset" === Q.type
            },
            button: function(Q) {
                return "button" === Q.type || Q.nodeName.toUpperCase() === "BUTTON"
            },
            input: function(Q) {
                return /input|select|textarea|button/i.test(Q.nodeName)
            }
        },
        setFilters: {
            first: function(R, Q) {
                return Q === 0
            },
            last: function(S, R, Q, T) {
                return R === T.length - 1
            },
            even: function(R, Q) {
                return Q % 2 === 0
            },
            odd: function(R, Q) {
                return Q % 2 === 1
            },
            lt: function(S, R, Q) {
                return R < Q[3] - 0
            },
            gt: function(S, R, Q) {
                return R > Q[3] - 0
            },
            nth: function(S, R, Q) {
                return Q[3] - 0 == R
            },
            eq: function(S, R, Q) {
                return Q[3] - 0 == R
            }
        },
        filter: {
            PSEUDO: function(W, S, T, X) {
                var R = S[1],
                    U = E.filters[R];
                if (U) {
                    return U(W, T, S, X)
                } else {
                    if (R === "contains") {
                        return (W.textContent || W.innerText || "").indexOf(S[3]) >= 0
                    } else {
                        if (R === "not") {
                            var V = S[3];
                            for (var T = 0, Q = V.length; T < Q; T++) {
                                if (V[T] === W) {
                                    return false
                                }
                            }
                            return true
                        }
                    }
                }
            },
            CHILD: function(Q, T) {
                var W = T[1],
                    R = Q;
                switch (W) {
                case "only":
                case "first":
                    while ((R = R.previousSibling)) {
                        if (R.nodeType === 1) {
                            return false
                        }
                    }
                    if (W == "first") {
                        return true
                    }
                    R = Q;
                case "last":
                    while ((R = R.nextSibling)) {
                        if (R.nodeType === 1) {
                            return false
                        }
                    }
                    return true;
                case "nth":
                    var S = T[2],
                        Z = T[3];
                    if (S == 1 && Z == 0) {
                        return true
                    }
                    var V = T[0],
                        Y = Q.parentNode;
                    if (Y && (Y.sizcache !== V || !Q.nodeIndex)) {
                        var U = 0;
                        for (R = Y.firstChild; R; R = R.nextSibling) {
                            if (R.nodeType === 1) {
                                R.nodeIndex = ++U
                            }
                        }
                        Y.sizcache = V
                    }
                    var X = Q.nodeIndex - Z;
                    if (S == 0) {
                        return X == 0
                    } else {
                        return (X % S == 0 && X / S >= 0)
                    }
                }
            },
            ID: function(R, Q) {
                return R.nodeType === 1 && R.getAttribute("id") === Q
            },
            TAG: function(R, Q) {
                return (Q === "*" && R.nodeType === 1) || R.nodeName === Q
            },
            CLASS: function(R, Q) {
                return (" " + (R.className || R.getAttribute("class")) + " ").indexOf(Q) > -1
            },
            ATTR: function(V, T) {
                var S = T[1],
                    Q = E.attrHandle[S] ? E.attrHandle[S](V) : V[S] != null ? V[S] : V.getAttribute(S),
                    W = Q + "",
                    U = T[2],
                    R = T[4];
                return Q == null ? U === "!=" : U === "=" ? W === R : U === "*=" ? W.indexOf(R) >= 0 : U === "~=" ? (" " + W + " ").indexOf(R) >= 0 : !R ? W && Q !== false : U === "!=" ? W != R : U === "^=" ? W.indexOf(R) === 0 : U === "$=" ? W.substr(W.length - R.length) === R : U === "|=" ? W === R || W.substr(0, R.length + 1) === R + "-" : false
            },
            POS: function(U, R, S, V) {
                var Q = R[2],
                    T = E.setFilters[Q];
                if (T) {
                    return T(U, S, R, V)
                }
            }
        }
    };
    var I = E.match.POS;
    for (var K in E.match) {
        E.match[K] = new RegExp(E.match[K].source + /(?![^\[]*\])(?![^\(]*\))/.source)
    }
    var A = function(R, Q) {
        R = Array.prototype.slice.call(R, 0);
        if (Q) {
            Q.push.apply(Q, R);
            return Q
        }
        return R
    };
    try {
        Array.prototype.slice.call(document.documentElement.childNodes, 0)
    } catch (J) {
        A = function(U, T) {
            var R = T || [];
            if (D.call(U) === "[object Array]") {
                Array.prototype.push.apply(R, U)
            } else {
                if (typeof U.length === "number") {
                    for (var S = 0, Q = U.length; S < Q; S++) {
                        R.push(U[S])
                    }
                } else {
                    for (var S = 0; U[S]; S++) {
                        R.push(U[S])
                    }
                }
            }
            return R
        }
    }
    var C;
    if (document.documentElement.compareDocumentPosition) {
        C = function(R, Q) {
            if (!R.compareDocumentPosition || !Q.compareDocumentPosition) {
                if (R == Q) {
                    M = true
                }
                return 0
            }
            var S = R.compareDocumentPosition(Q) & 4 ? -1 : R === Q ? 0 : 1;
            if (S === 0) {
                M = true
            }
            return S
        }
    } else {
        if ("sourceIndex" in document.documentElement) {
            C = function(R, Q) {
                if (!R.sourceIndex || !Q.sourceIndex) {
                    if (R == Q) {
                        M = true
                    }
                    return 0
                }
                var S = R.sourceIndex - Q.sourceIndex;
                if (S === 0) {
                    M = true
                }
                return S
            }
        } else {
            if (document.createRange) {
                C = function(T, R) {
                    if (!T.ownerDocument || !R.ownerDocument) {
                        if (T == R) {
                            M = true
                        }
                        return 0
                    }
                    var S = T.ownerDocument.createRange(),
                        Q = R.ownerDocument.createRange();
                    S.selectNode(T);
                    S.collapse(true);
                    Q.selectNode(R);
                    Q.collapse(true);
                    var U = S.compareBoundaryPoints(Range.START_TO_END, Q);
                    if (U === 0) {
                        M = true
                    }
                    return U
                }
            }
        }
    }(function() {
        var R = document.createElement("div"),
            S = "script" + (new Date).getTime();
        R.innerHTML = "<a name='" + S + "'/>";
        var Q = document.documentElement;
        Q.insertBefore(R, Q.firstChild);
        if ( !! document.getElementById(S)) {
            E.find.ID = function(U, V, W) {
                if (typeof V.getElementById !== "undefined" && !W) {
                    var T = V.getElementById(U[1]);
                    return T ? T.id === U[1] || typeof T.getAttributeNode !== "undefined" && T.getAttributeNode("id").nodeValue === U[1] ? [T] : undefined : []
                }
            };
            E.filter.ID = function(V, T) {
                var U = typeof V.getAttributeNode !== "undefined" && V.getAttributeNode("id");
                return V.nodeType === 1 && U && U.nodeValue === T
            }
        }
        Q.removeChild(R);
        Q = R = null
    })();
    (function() {
        var Q = document.createElement("div");
        Q.appendChild(document.createComment(""));
        if (Q.getElementsByTagName("*").length > 0) {
            E.find.TAG = function(R, V) {
                var U = V.getElementsByTagName(R[1]);
                if (R[1] === "*") {
                    var T = [];
                    for (var S = 0; U[S]; S++) {
                        if (U[S].nodeType === 1) {
                            T.push(U[S])
                        }
                    }
                    U = T
                }
                return U
            }
        }
        Q.innerHTML = "<a href='#'></a>";
        if (Q.firstChild && typeof Q.firstChild.getAttribute !== "undefined" && Q.firstChild.getAttribute("href") !== "#") {
            E.attrHandle.href = function(R) {
                return R.getAttribute("href", 2)
            }
        }
        Q = null
    })();
    if (document.querySelectorAll) {
        (function() {
            var Q = B,
                S = document.createElement("div");
            S.innerHTML = "<p class='TEST'></p>";
            if (S.querySelectorAll && S.querySelectorAll(".TEST").length === 0) {
                return
            }
            B = function(W, V, T, U) {
                V = V || document;
                if (!U && V.nodeType === 9 && !N(V)) {
                    try {
                        return A(V.querySelectorAll(W), T)
                    } catch (X) {}
                }
                return Q(W, V, T, U)
            };
            for (var R in Q) {
                B[R] = Q[R]
            }
            S = null
        })()
    }
    if (document.getElementsByClassName && document.documentElement.getElementsByClassName) {
        (function() {
            var Q = document.createElement("div");
            Q.innerHTML = "<div class='test e'></div><div class='test'></div>";
            if (Q.getElementsByClassName("e").length === 0) {
                return
            }
            Q.lastChild.className = "e";
            if (Q.getElementsByClassName("e").length === 1) {
                return
            }
            E.order.splice(1, 0, "CLASS");
            E.find.CLASS = function(R, S, T) {
                if (typeof S.getElementsByClassName !== "undefined" && !T) {
                    return S.getElementsByClassName(R[1])
                }
            };
            Q = null
        })()
    }
    function L(R, W, V, a, X, Z) {
        var Y = R == "previousSibling" && !Z;
        for (var T = 0, S = a.length; T < S; T++) {
            var Q = a[T];
            if (Q) {
                if (Y && Q.nodeType === 1) {
                    Q.sizcache = V;
                    Q.sizset = T
                }
                Q = Q[R];
                var U = false;
                while (Q) {
                    if (Q.sizcache === V) {
                        U = a[Q.sizset];
                        break
                    }
                    if (Q.nodeType === 1 && !Z) {
                        Q.sizcache = V;
                        Q.sizset = T
                    }
                    if (Q.nodeName === W) {
                        U = Q;
                        break
                    }
                    Q = Q[R]
                }
                a[T] = U
            }
        }
    }
    function P(R, W, V, a, X, Z) {
        var Y = R == "previousSibling" && !Z;
        for (var T = 0, S = a.length; T < S; T++) {
            var Q = a[T];
            if (Q) {
                if (Y && Q.nodeType === 1) {
                    Q.sizcache = V;
                    Q.sizset = T
                }
                Q = Q[R];
                var U = false;
                while (Q) {
                    if (Q.sizcache === V) {
                        U = a[Q.sizset];
                        break
                    }
                    if (Q.nodeType === 1) {
                        if (!Z) {
                            Q.sizcache = V;
                            Q.sizset = T
                        }
                        if (typeof W !== "string") {
                            if (Q === W) {
                                U = true;
                                break
                            }
                        } else {
                            if (B.filter(W, [Q]).length > 0) {
                                U = Q;
                                break
                            }
                        }
                    }
                    Q = Q[R]
                }
                a[T] = U
            }
        }
    }
    var G = document.compareDocumentPosition ?
    function(R, Q) {
        return R.compareDocumentPosition(Q) & 16
    } : function(R, Q) {
        return R !== Q && (R.contains ? R.contains(Q) : true)
    };
    var N = function(Q) {
        return Q.nodeType === 9 && Q.documentElement.nodeName !== "HTML" || !! Q.ownerDocument && Q.ownerDocument.documentElement.nodeName !== "HTML"
    };
    var F = function(Q, X) {
        var T = [],
            U = "",
            V, S = X.nodeType ? [X] : X;
        while ((V = E.match.PSEUDO.exec(Q))) {
            U += V[0];
            Q = Q.replace(E.match.PSEUDO, "")
        }
        Q = E.relative[Q] ? Q + "*" : Q;
        for (var W = 0, R = S.length; W < R; W++) {
            B(Q, S[W], T)
        }
        return B.filter(U, T)
    };
    window.Sizzle = B
})();
if (!daum.Browser.webkit) {
    JSON = undefined
}
if (!this.JSON) {
    this.JSON = {}
}(function() {
    function f(n) {
        return n < 10 ? "0" + n : n
    }
    if (typeof Date.prototype.toJSON !== "function") {
        Date.prototype.toJSON = function(key) {
            return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + f(this.getUTCMonth() + 1) + "-" + f(this.getUTCDate()) + "T" + f(this.getUTCHours()) + ":" + f(this.getUTCMinutes()) + ":" + f(this.getUTCSeconds()) + "Z" : null
        };
        String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function(key) {
            return this.valueOf()
        }
    }
    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap, indent, meta = {
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            '"': '\\"',
            "\\": "\\\\"
        },
        rep;

    function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function(a) {
            var c = meta[a];
            return typeof c === "string" ? c : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
        }) + '"' : '"' + string + '"'
    }
    function str(key, holder) {
        var i, k, v, length, mind = gap,
            partial, value = holder[key];
        if (value && typeof value === "object" && typeof value.toJSON === "function") {
            value = value.toJSON(key)
        }
        if (typeof rep === "function") {
            value = rep.call(holder, key, value)
        }
        switch (typeof value) {
        case "string":
            return quote(value);
        case "number":
            return isFinite(value) ? String(value) : "null";
        case "boolean":
        case "null":
            return String(value);
        case "object":
            if (!value) {
                return "null"
            }
            gap += indent;
            partial = [];
            if (Object.prototype.toString.apply(value) === "[object Array]") {
                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || "null"
                }
                v = partial.length === 0 ? "[]" : gap ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]" : "[" + partial.join(",") + "]";
                gap = mind;
                return v
            }
            if (rep && typeof rep === "object") {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === "string") {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ": " : ":") + v)
                        }
                    }
                }
            } else {
                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ": " : ":") + v)
                        }
                    }
                }
            }
            v = partial.length === 0 ? "{}" : gap ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}" : "{" + partial.join(",") + "}";
            gap = mind;
            return v
        }
    }
    if (typeof JSON.stringify !== "function") {
        JSON.stringify = function(value, replacer, space) {
            var i;
            gap = "";
            indent = "";
            if (typeof space === "number") {
                for (i = 0; i < space; i += 1) {
                    indent += " "
                }
            } else {
                if (typeof space === "string") {
                    indent = space
                }
            }
            rep = replacer;
            if (replacer && typeof replacer !== "function" && (typeof replacer !== "object" || typeof replacer.length !== "number")) {
                throw new Error("JSON.stringify")
            }
            return str("", {
                "": value
            })
        }
    }
    if (typeof JSON.parse !== "function") {
        JSON.parse = function(text, reviver) {
            var j;

            function walk(holder, key) {
                var k, v, value = holder[key];
                if (value && typeof value === "object") {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v
                            } else {
                                delete value[k]
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value)
            }
            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function(a) {
                    return "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
                })
            }
            if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {
                j = eval("(" + text + ")");
                return typeof reviver === "function" ? walk({
                    "": j
                }, "") : j
            }
            throw new SyntaxError("JSON.parse")
        }
    }
}());
/*
 * Jigu Initialization
 *  more information: http://play.daumcorp.com/display/ftst/Jigu+Initialization
 */
(function() {
    if (!window.$) {
        window.$ = daum.$
    }
    if (!window.$A) {
        window.$A = daum.$A
    }
    if (!window.$E) {
        window.$E = daum.$E
    }
    if (!window.$T) {
        window.$T = daum.$T
    }
    if (!window.$C) {
        window.$C = daum.$C
    }
    if (window.Sizzle) {
        window.$$ = daum.$$ = window.Sizzle
    }
    daum.extend(daum, daum.Event);
    daum.extend(daum, daum.Browser);
    daum.extend(daum, daum.Element);
    if (daum.Event.GC != undefined) {
        window.JiguEventGC = daum.Function.interval(daum.Event.GC, 60000, daum.Event)
    }
    daum.Event.addEvent(window, "load", function() {
        daum.documentLoaded = true
    });
    daum.nativeExtend();
    if (!window.console) {
        window.console = {
            debug: function() {},
            log: function() {}
        }
    } else {
        if (!window.console.log) {
            window.console.debug = window.console.log = function() {}
        } else {
            if (!window.console.debug) {
                window.console.debug = function() {
                    for (var A = 0, B = arguments.length; A < B; A++) {
                        window.console.log(arguments[A])
                    }
                }
            }
        }
    }
    return true
})();
/* Ajax API (APIs are same with the prototype.js)
 */
var cubeAjax = {
    _xmlHttpRequest: function(A) {
        if (window.XMLHttpRequest) {
            try {
                A = new XMLHttpRequest()
            } catch (B) {
                A = false
            }
        } else {
            if (window.ActiveXObject) {
                try {
                    A = new ActiveXObject("Msxml2.XMLHTTP")
                } catch (B) {
                    try {
                        A = new ActiveXObject("Microsoft.XMLHTTP")
                    } catch (B) {
                        A = false
                    }
                }
            }
        }
        return A
    },
    _updateDiv: function(B, A) {
        document.getElementById(B).innerHTML = A.responseText
    },
    _request: function(B, A) {
        var C = this._xmlHttpRequest();
        if (C) {
            C.onreadystatechange = function() {
                if (C.readyState == 4) {
                    if ((typeof C.status == "undefined" && navigator.userAgent.match(/Safari/)) || C.status == 200) {
                        if (A.updateDiv) {
                            cubeAjax._updateDiv(A.updateDiv, C)
                        }
                        A.onComplete(C)
                    }
                }
            }
        }
        if (A.method != "POST") {
            if (A.parameters != "") {
                B += "?" + A.parameters
            }
        }
        C.open(A.method, B, true);
        C.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        if (A.method == "POST") {
            C.setRequestHeader("Content-Type", A.contentType)
        }
        C.setRequestHeader("Connection", "close");
        C.send((A.method == "POST") ? A.parameters : null)
    },
    _setOptions: function(A) {
        _options = {
            method: "POST",
            contentType: "application/x-www-form-urlencoded",
            parameters: "",
            onComplete: function() {},
            updateDiv: ""
        };
        for (var B in A) {
            if (B == "method") {
                _options[B] = A[B].toUpperCase()
            } else {
                _options[B] = A[B]
            }
        }
        return _options
    },
    Updater: function(C, B, A) {
        A.updateDiv = C;
        this._request(B, this._setOptions(A))
    },
    Request: function(B, A) {
        this._request(B, this._setOptions(A))
    }
};
/* SWFObject v2.1 <http://code.google.com/p/swfobject/>
    Copyright (c) 2007-2008 Geoff Stearns, Michael Williams, and Bobby van der Sluis
    This software is released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
*/
var swfobject = function() {
    var b = "undefined",
        Q = "object",
        n = "Shockwave Flash",
        p = "ShockwaveFlash.ShockwaveFlash",
        P = "application/x-shockwave-flash",
        m = "SWFObjectExprInst",
        j = window,
        K = document,
        T = navigator,
        o = [],
        N = [],
        i = [],
        d = [],
        J, Z = null,
        M = null,
        l = null,
        e = false,
        A = false;
    var h = function() {
        var v = typeof K.getElementById != b && typeof K.getElementsByTagName != b && typeof K.createElement != b,
            AC = [0, 0, 0],
            x = null;
        if (typeof T.plugins != b && typeof T.plugins[n] == Q) {
            x = T.plugins[n].description;
            if (x && !(typeof T.mimeTypes != b && T.mimeTypes[P] && !T.mimeTypes[P].enabledPlugin)) {
                x = x.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
                AC[0] = parseInt(x.replace(/^(.*)\..*$/, "$1"), 10);
                AC[1] = parseInt(x.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
                AC[2] = /r/.test(x) ? parseInt(x.replace(/^.*r(.*)$/, "$1"), 10) : 0
            }
        } else {
            if (typeof j.ActiveXObject != b) {
                var y = null,
                    AB = false;
                try {
                    y = new ActiveXObject(p + ".7")
                } catch (t) {
                    try {
                        y = new ActiveXObject(p + ".6");
                        AC = [6, 0, 21];
                        y.AllowScriptAccess = "always"
                    } catch (t) {
                        if (AC[0] == 6) {
                            AB = true
                        }
                    }
                    if (!AB) {
                        try {
                            y = new ActiveXObject(p)
                        } catch (t) {}
                    }
                }
                if (!AB && y) {
                    try {
                        x = y.GetVariable("$version");
                        if (x) {
                            x = x.split(" ")[1].split(",");
                            AC = [parseInt(x[0], 10), parseInt(x[1], 10), parseInt(x[2], 10)]
                        }
                    } catch (t) {}
                }
            }
        }
        var AD = T.userAgent.toLowerCase(),
            r = T.platform.toLowerCase(),
            AA = /webkit/.test(AD) ? parseFloat(AD.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false,
            q = false,
            z = r ? /win/.test(r) : /win/.test(AD),
            w = r ? /mac/.test(r) : /mac/.test(AD); /*@cc_on q=true;@if(@_win32)z=true;@elif(@_mac)w=true;@end@*/
        return {
            w3cdom: v,
            pv: AC,
            webkit: AA,
            ie: q,
            win: z,
            mac: w
        }
    }();
    var L = function() {
        if (!h.w3cdom) {
            return
        }
        f(H);
        if (h.ie && h.win) {
            try {
                K.write("<script id=__ie_ondomload defer=true src=//:><\/script>");
                J = C("__ie_ondomload");
                if (J) {
                    I(J, "onreadystatechange", S)
                }
            } catch (q) {}
        }
        if (h.webkit && typeof K.readyState != b) {
            Z = setInterval(function() {
                if (/loaded|complete/.test(K.readyState)) {
                    E()
                }
            }, 10)
        }
        if (typeof K.addEventListener != b) {
            K.addEventListener("DOMContentLoaded", E, null)
        }
        R(E)
    }();

    function S() {
        if (J.readyState == "complete") {
            J.parentNode.removeChild(J);
            E()
        }
    }
    function E() {
        if (e) {
            return
        }
        if (h.ie && h.win) {
            var v = a("span");
            try {
                var u = K.getElementsByTagName("body")[0].appendChild(v);
                u.parentNode.removeChild(u)
            } catch (w) {
                return
            }
        }
        e = true;
        if (Z) {
            clearInterval(Z);
            Z = null
        }
        var q = o.length;
        for (var r = 0; r < q; r++) {
            o[r]()
        }
    }
    function f(q) {
        if (e) {
            q()
        } else {
            o[o.length] = q
        }
    }
    function R(r) {
        if (typeof j.addEventListener != b) {
            j.addEventListener("load", r, false)
        } else {
            if (typeof K.addEventListener != b) {
                K.addEventListener("load", r, false)
            } else {
                if (typeof j.attachEvent != b) {
                    I(j, "onload", r)
                } else {
                    if (typeof j.onload == "function") {
                        var q = j.onload;
                        j.onload = function() {
                            q();
                            r()
                        }
                    } else {
                        j.onload = r
                    }
                }
            }
        }
    }
    function H() {
        var t = N.length;
        for (var q = 0; q < t; q++) {
            var u = N[q].id;
            if (h.pv[0] > 0) {
                var r = C(u);
                if (r) {
                    N[q].width = r.getAttribute("width") ? r.getAttribute("width") : "0";
                    N[q].height = r.getAttribute("height") ? r.getAttribute("height") : "0";
                    if (c(N[q].swfVersion)) {
                        if (h.webkit && h.webkit < 312) {
                            Y(r)
                        }
                        W(u, true)
                    } else {
                        if (N[q].expressInstall && !A && c("6.0.65") && (h.win || h.mac)) {
                            k(N[q])
                        } else {
                            O(r)
                        }
                    }
                }
            } else {
                W(u, true)
            }
        }
    }
    function Y(t) {
        var q = t.getElementsByTagName(Q)[0];
        if (q) {
            var w = a("embed"),
                y = q.attributes;
            if (y) {
                var v = y.length;
                for (var u = 0; u < v; u++) {
                    if (y[u].nodeName == "DATA") {
                        w.setAttribute("src", y[u].nodeValue)
                    } else {
                        w.setAttribute(y[u].nodeName, y[u].nodeValue)
                    }
                }
            }
            var x = q.childNodes;
            if (x) {
                var z = x.length;
                for (var r = 0; r < z; r++) {
                    if (x[r].nodeType == 1 && x[r].nodeName == "PARAM") {
                        w.setAttribute(x[r].getAttribute("name"), x[r].getAttribute("value"))
                    }
                }
            }
            t.parentNode.replaceChild(w, t)
        }
    }
    function k(w) {
        A = true;
        var u = C(w.id);
        if (u) {
            if (w.altContentId) {
                var y = C(w.altContentId);
                if (y) {
                    M = y;
                    l = w.altContentId
                }
            } else {
                M = G(u)
            }
            if (!(/%$/.test(w.width)) && parseInt(w.width, 10) < 310) {
                w.width = "310"
            }
            if (!(/%$/.test(w.height)) && parseInt(w.height, 10) < 137) {
                w.height = "137"
            }
            K.title = K.title.slice(0, 47) + " - Flash Player Installation";
            var z = h.ie && h.win ? "ActiveX" : "PlugIn",
                q = K.title,
                r = "MMredirectURL=" + j.location + "&MMplayerType=" + z + "&MMdoctitle=" + q,
                x = w.id;
            if (h.ie && h.win && u.readyState != 4) {
                var t = a("div");
                x += "SWFObjectNew";
                t.setAttribute("id", x);
                u.parentNode.insertBefore(t, u);
                u.style.display = "none";
                var v = function() {
                    u.parentNode.removeChild(u)
                };
                I(j, "onload", v)
            }
            U({
                data: w.expressInstall,
                id: m,
                width: w.width,
                height: w.height
            }, {
                flashvars: r
            }, x)
        }
    }
    function O(t) {
        if (h.ie && h.win && t.readyState != 4) {
            var r = a("div");
            t.parentNode.insertBefore(r, t);
            r.parentNode.replaceChild(G(t), r);
            t.style.display = "none";
            var q = function() {
                t.parentNode.removeChild(t)
            };
            I(j, "onload", q)
        } else {
            t.parentNode.replaceChild(G(t), t)
        }
    }
    function G(v) {
        var u = a("div");
        if (h.win && h.ie) {
            u.innerHTML = v.innerHTML
        } else {
            var r = v.getElementsByTagName(Q)[0];
            if (r) {
                var w = r.childNodes;
                if (w) {
                    var q = w.length;
                    for (var t = 0; t < q; t++) {
                        if (!(w[t].nodeType == 1 && w[t].nodeName == "PARAM") && !(w[t].nodeType == 8)) {
                            u.appendChild(w[t].cloneNode(true))
                        }
                    }
                }
            }
        }
        return u
    }
    function U(AG, AE, t) {
        var q, v = C(t);
        if (v) {
            if (typeof AG.id == b) {
                AG.id = t
            }
            if (h.ie && h.win) {
                var AF = "";
                for (var AB in AG) {
                    if (AG[AB] != Object.prototype[AB]) {
                        if (AB.toLowerCase() == "data") {
                            AE.movie = AG[AB]
                        } else {
                            if (AB.toLowerCase() == "styleclass") {
                                AF += ' class="' + AG[AB] + '"'
                            } else {
                                if (AB.toLowerCase() != "classid") {
                                    AF += " " + AB + '="' + AG[AB] + '"'
                                }
                            }
                        }
                    }
                }
                var AD = "";
                for (var AA in AE) {
                    if (AE[AA] != Object.prototype[AA]) {
                        AD += '<param name="' + AA + '" value="' + AE[AA] + '" />'
                    }
                }
                v.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + AF + ">" + AD + "</object>";
                i[i.length] = AG.id;
                q = C(AG.id)
            } else {
                if (h.webkit && h.webkit < 312) {
                    var AC = a("embed");
                    AC.setAttribute("type", P);
                    for (var z in AG) {
                        if (AG[z] != Object.prototype[z]) {
                            if (z.toLowerCase() == "data") {
                                AC.setAttribute("src", AG[z])
                            } else {
                                if (z.toLowerCase() == "styleclass") {
                                    AC.setAttribute("class", AG[z])
                                } else {
                                    if (z.toLowerCase() != "classid") {
                                        AC.setAttribute(z, AG[z])
                                    }
                                }
                            }
                        }
                    }
                    for (var y in AE) {
                        if (AE[y] != Object.prototype[y]) {
                            if (y.toLowerCase() != "movie") {
                                AC.setAttribute(y, AE[y])
                            }
                        }
                    }
                    v.parentNode.replaceChild(AC, v);
                    q = AC
                } else {
                    var u = a(Q);
                    u.setAttribute("type", P);
                    for (var x in AG) {
                        if (AG[x] != Object.prototype[x]) {
                            if (x.toLowerCase() == "styleclass") {
                                u.setAttribute("class", AG[x])
                            } else {
                                if (x.toLowerCase() != "classid") {
                                    u.setAttribute(x, AG[x])
                                }
                            }
                        }
                    }
                    for (var w in AE) {
                        if (AE[w] != Object.prototype[w] && w.toLowerCase() != "movie") {
                            F(u, w, AE[w])
                        }
                    }
                    v.parentNode.replaceChild(u, v);
                    q = u
                }
            }
        }
        return q
    }
    function F(t, q, r) {
        var u = a("param");
        u.setAttribute("name", q);
        u.setAttribute("value", r);
        t.appendChild(u)
    }
    function X(r) {
        var q = C(r);
        if (q && (q.nodeName == "OBJECT" || q.nodeName == "EMBED")) {
            if (h.ie && h.win) {
                if (q.readyState == 4) {
                    B(r)
                } else {
                    j.attachEvent("onload", function() {
                        B(r)
                    })
                }
            } else {
                q.parentNode.removeChild(q)
            }
        }
    }
    function B(t) {
        var r = C(t);
        if (r) {
            for (var q in r) {
                if (typeof r[q] == "function") {
                    r[q] = null
                }
            }
            r.parentNode.removeChild(r)
        }
    }
    function C(t) {
        var q = null;
        try {
            q = K.getElementById(t)
        } catch (r) {}
        return q
    }
    function a(q) {
        return K.createElement(q)
    }
    function I(t, q, r) {
        t.attachEvent(q, r);
        d[d.length] = [t, q, r]
    }
    function c(t) {
        var r = h.pv,
            q = t.split(".");
        q[0] = parseInt(q[0], 10);
        q[1] = parseInt(q[1], 10) || 0;
        q[2] = parseInt(q[2], 10) || 0;
        return (r[0] > q[0] || (r[0] == q[0] && r[1] > q[1]) || (r[0] == q[0] && r[1] == q[1] && r[2] >= q[2])) ? true : false
    }
    function V(v, r) {
        if (h.ie && h.mac) {
            return
        }
        var u = K.getElementsByTagName("head")[0],
            t = a("style");
        t.setAttribute("type", "text/css");
        t.setAttribute("media", "screen");
        if (!(h.ie && h.win) && typeof K.createTextNode != b) {
            t.appendChild(K.createTextNode(v + " {" + r + "}"))
        }
        u.appendChild(t);
        if (h.ie && h.win && typeof K.styleSheets != b && K.styleSheets.length > 0) {
            var q = K.styleSheets[K.styleSheets.length - 1];
            if (typeof q.addRule == Q) {
                q.addRule(v, r)
            }
        }
    }
    function W(t, q) {
        var r = q ? "visible" : "hidden";
        if (e && C(t)) {
            C(t).style.visibility = r
        } else {
            V("#" + t, "visibility:" + r)
        }
    }
    function g(s) {
        var r = /[\\\"<>\.;]/;
        var q = r.exec(s) != null;
        return q ? encodeURIComponent(s) : s
    }
    var D = function() {
        if (h.ie && h.win) {
            window.attachEvent("onunload", function() {
                var w = d.length;
                for (var v = 0; v < w; v++) {
                    d[v][0].detachEvent(d[v][1], d[v][2])
                }
                var t = i.length;
                for (var u = 0; u < t; u++) {
                    X(i[u])
                }
                for (var r in h) {
                    h[r] = null
                }
                h = null;
                for (var q in swfobject) {
                    swfobject[q] = null
                }
                swfobject = null
            })
        }
    }();
    return {
        registerObject: function(u, q, t) {
            if (!h.w3cdom || !u || !q) {
                return
            }
            var r = {};
            r.id = u;
            r.swfVersion = q;
            r.expressInstall = t ? t : false;
            N[N.length] = r;
            W(u, false)
        },
        getObjectById: function(v) {
            var q = null;
            if (h.w3cdom) {
                var t = C(v);
                if (t) {
                    var u = t.getElementsByTagName(Q)[0];
                    if (!u || (u && typeof t.SetVariable != b)) {
                        q = t
                    } else {
                        if (typeof u.SetVariable != b) {
                            q = u
                        }
                    }
                }
            }
            return q
        },
        embedSWF: function(x, AE, AB, AD, q, w, r, z, AC) {
            if (!h.w3cdom || !x || !AE || !AB || !AD || !q) {
                return
            }
            AB += "";
            AD += "";
            if (c(q)) {
                W(AE, false);
                var AA = {};
                if (AC && typeof AC === Q) {
                    for (var v in AC) {
                        if (AC[v] != Object.prototype[v]) {
                            AA[v] = AC[v]
                        }
                    }
                }
                AA.data = x;
                AA.width = AB;
                AA.height = AD;
                var y = {};
                if (z && typeof z === Q) {
                    for (var u in z) {
                        if (z[u] != Object.prototype[u]) {
                            y[u] = z[u]
                        }
                    }
                }
                if (r && typeof r === Q) {
                    for (var t in r) {
                        if (r[t] != Object.prototype[t]) {
                            if (typeof y.flashvars != b) {
                                y.flashvars += "&" + t + "=" + r[t]
                            } else {
                                y.flashvars = t + "=" + r[t]
                            }
                        }
                    }
                }
                f(function() {
                    U(AA, y, AE);
                    if (AA.id == AE) {
                        W(AE, true)
                    }
                })
            } else {
                if (w && !A && c("6.0.65") && (h.win || h.mac)) {
                    A = true;
                    W(AE, false);
                    f(function() {
                        var AF = {};
                        AF.id = AF.altContentId = AE;
                        AF.width = AB;
                        AF.height = AD;
                        AF.expressInstall = w;
                        k(AF)
                    })
                }
            }
        },
        getFlashPlayerVersion: function() {
            return {
                major: h.pv[0],
                minor: h.pv[1],
                release: h.pv[2]
            }
        },
        hasFlashPlayerVersion: c,
        createSWF: function(t, r, q) {
            if (h.w3cdom) {
                return U(t, r, q)
            } else {
                return undefined
            }
        },
        removeSWF: function(q) {
            if (h.w3cdom) {
                X(q)
            }
        },
        createCSS: function(r, q) {
            if (h.w3cdom) {
                V(r, q)
            }
        },
        addDomLoadEvent: f,
        addLoadEvent: R,
        getQueryParamValue: function(v) {
            var u = K.location.search || K.location.hash;
            if (v == null) {
                return g(u)
            }
            if (u) {
                var t = u.substring(1).split("&");
                for (var r = 0; r < t.length; r++) {
                    if (t[r].substring(0, t[r].indexOf("=")) == v) {
                        return g(t[r].substring((t[r].indexOf("=") + 1)))
                    }
                }
            }
            return ""
        },
        expressInstallCallback: function() {
            if (A && M) {
                var q = C(m);
                if (q) {
                    q.parentNode.replaceChild(M, q);
                    if (l) {
                        W(l, true);
                        if (h.ie && h.win) {
                            M.style.display = "block"
                        }
                    }
                    M = null;
                    l = null;
                    A = false
                }
            }
        }
    }
}();
var TrimPath;
(function() {
    if (TrimPath == null) {
        TrimPath = new Object()
    }
    if (TrimPath.evalEx == null) {
        TrimPath.evalEx = function(src) {
            return eval(src)
        }
    }
    var UNDEFINED;
    if (Array.prototype.pop == null) {
        Array.prototype.pop = function() {
            if (this.length === 0) {
                return UNDEFINED
            }
            return this[--this.length]
        }
    }
    if (Array.prototype.push == null) {
        Array.prototype.push = function() {
            for (var i = 0; i < arguments.length; ++i) {
                this[this.length] = arguments[i]
            }
            return this.length
        }
    }
    TrimPath.parseTemplate = function(tmplContent, optTmplName, optEtc) {
        if (optEtc == null) {
            optEtc = TrimPath.parseTemplate_etc
        }
        var funcSrc = parse(tmplContent, optTmplName, optEtc);
        var func = TrimPath.evalEx(funcSrc, optTmplName, 1);
        if (func != null) {
            return new optEtc.Template(optTmplName, tmplContent, funcSrc, func, optEtc)
        }
        return null
    };
    try {
        String.prototype.process = function(context, optFlags) {
            var template = TrimPath.parseTemplate(this, null);
            if (template != null) {
                return template.process(context, optFlags)
            }
            return this
        }
    } catch (e) {}
    TrimPath.parseTemplate_etc = {};
    TrimPath.loopIndex = 0;
    TrimPath.parseTemplate_etc.statementTag = "forelse|for|if|elseif|else|var|macro";
    TrimPath.parseTemplate_etc.statementDef = {
        "if": {
            delta: 1,
            prefix: "if (",
            suffix: ") {",
            paramMin: 1
        },
        "else": {
            delta: 0,
            prefix: "} else {"
        },
        elseif: {
            delta: 0,
            prefix: "} else if (",
            suffix: ") {",
            paramDefault: "true"
        },
        "/if": {
            delta: -1,
            prefix: "}"
        },
        "for": {
            delta: 1,
            paramMin: 3,
            prefixFunc: function(stmtParts, state, tmplName, etc) {
                if (stmtParts[2] != "in") {
                    throw new etc.ParseError(tmplName, state.line, "bad for loop statement: " + stmtParts.join(" "))
                }
                var iterVar = stmtParts[1];
                var listVar = "__LIST__" + iterVar;
                TrimPath.loopIndex++;
                if (stmtParts.length == 6) {
                    var startVar = stmtParts[4];
                    var endVar = stmtParts[5];
                    return ["var ", listVar, " = ", stmtParts[3], ";", "var __LENGTH_STACK__;", "if (typeof(__LENGTH_STACK__) == 'undefined' || !__LENGTH_STACK__.length) __LENGTH_STACK__ = new Array();", "__LENGTH_STACK__[__LENGTH_STACK__.length] = 0;", "if ((", listVar, ") != null) { ", "var ", iterVar, "_ct = 0;", "for (var ", "i" + TrimPath.loopIndex, "=", startVar, "; ", "i" + TrimPath.loopIndex, "<", endVar, ";", "i" + TrimPath.loopIndex, "++) { ", iterVar, "_ct++;", "__LENGTH_STACK__[__LENGTH_STACK__.length - 1]++;", "var ", iterVar, " = ", listVar, "[", "i" + TrimPath.loopIndex, "];"].join("")
                } else {
                    return ["var ", listVar, " = ", stmtParts[3], ";", "var __LENGTH_STACK__;", "if (typeof(__LENGTH_STACK__) == 'undefined' || !__LENGTH_STACK__.length) __LENGTH_STACK__ = new Array();", "__LENGTH_STACK__[__LENGTH_STACK__.length] = 0;", "if ((", listVar, ") != null) { ", "var ", iterVar, "_ct = 0;", "for (var ", "i" + TrimPath.loopIndex, "=0; ", "i" + TrimPath.loopIndex, "<", listVar, ".length;", "i" + TrimPath.loopIndex, "++) { ", iterVar, "_ct++;", "__LENGTH_STACK__[__LENGTH_STACK__.length - 1]++;", "var ", iterVar, " = ", listVar, "[", "i" + TrimPath.loopIndex, "];"].join("")
                }
            }
        },
        forelse: {
            delta: 0,
            prefix: "} } if (__LENGTH_STACK__[__LENGTH_STACK__.length - 1] == 0) { if (",
            suffix: ") {",
            paramDefault: "true"
        },
        "/for": {
            delta: -1,
            prefix: "} }; delete __LENGTH_STACK__[__LENGTH_STACK__.length - 1];"
        },
        "var": {
            delta: 0,
            prefix: "var ",
            suffix: ";"
        },
        macro: {
            delta: 1,
            prefixFunc: function(stmtParts, state, tmplName, etc) {
                var macroName = stmtParts[1].split("(")[0];
                return ["var ", macroName, " = function", stmtParts.slice(1).join(" ").substring(macroName.length), "{ var _OUT_arr = []; var _OUT = { write: function(m) { if (m) _OUT_arr.push(m); } }; "].join("")
            }
        },
        "/macro": {
            delta: -1,
            prefix: " return _OUT_arr.join(''); };"
        }
    };
    TrimPath.parseTemplate_etc.modifierDef = {
        eat: function(v) {
            return ""
        },
        escape: function(s) {
            return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        },
        capitalize: function(s) {
            return String(s).toUpperCase()
        },
        "default": function(s, d) {
            return s != null ? s : d
        }
    };
    TrimPath.parseTemplate_etc.modifierDef.h = TrimPath.parseTemplate_etc.modifierDef.escape;
    TrimPath.parseTemplate_etc.Template = function(tmplName, tmplContent, funcSrc, func, etc) {
        this.process = function(context, flags) {
            if (context == null) {
                context = {}
            }
            if (context._MODIFIERS == null) {
                context._MODIFIERS = {}
            }
            if (context.defined == null) {
                context.defined = function(str) {
                    return (context[str] != undefined)
                }
            }
            for (var k in etc.modifierDef) {
                if (context._MODIFIERS[k] == null) {
                    context._MODIFIERS[k] = etc.modifierDef[k]
                }
            }
            if (flags == null) {
                flags = {}
            }
            var resultArr = [];
            var resultOut = {
                write: function(m) {
                    resultArr.push(m)
                }
            };
            try {
                func(resultOut, context, flags)
            } catch (e) {
                if (flags.throwExceptions == true) {
                    throw e
                }
                var result = new String(resultArr.join("") + "[ERROR: " + e.toString() + (e.message ? "; " + e.message : "") + "]");
                result.exception = e;
                return result
            }
            return resultArr.join("")
        };
        this.name = tmplName;
        this.source = tmplContent;
        this.sourceFunc = funcSrc;
        this.toString = function() {
            return "TrimPath.Template [" + tmplName + "]"
        }
    };
    TrimPath.parseTemplate_etc.ParseError = function(name, line, message) {
        this.name = name;
        this.line = line;
        this.message = message
    };
    TrimPath.parseTemplate_etc.ParseError.prototype.toString = function() {
        return ("TrimPath template ParseError in " + this.name + ": line " + this.line + ", " + this.message)
    };
    var parse = function(body, tmplName, etc) {
        body = cleanWhiteSpace(body);
        var funcText = ["var TrimPath_Template_TEMP = function(_OUT, _CONTEXT, _FLAGS) { with (_CONTEXT) {"];
        var state = {
            stack: [],
            line: 1
        };
        var endStmtPrev = -1;
        while (endStmtPrev + 1 < body.length) {
            var begStmt = endStmtPrev;
            begStmt = body.indexOf("{", begStmt + 1);
            while (begStmt >= 0) {
                var endStmt = body.indexOf("}", begStmt + 1);
                var stmt = body.substring(begStmt, endStmt);
                var blockrx = stmt.match(/^\{(cdata|minify|eval)/);
                if (blockrx) {
                    var blockType = blockrx[1];
                    var blockMarkerBeg = begStmt + blockType.length + 1;
                    var blockMarkerEnd = body.indexOf("}", blockMarkerBeg);
                    if (blockMarkerEnd >= 0) {
                        var blockMarker;
                        if (blockMarkerEnd - blockMarkerBeg <= 0) {
                            blockMarker = "{/" + blockType + "}"
                        } else {
                            blockMarker = body.substring(blockMarkerBeg + 1, blockMarkerEnd)
                        }
                        var blockEnd = body.indexOf(blockMarker, blockMarkerEnd + 1);
                        if (blockEnd >= 0) {
                            emitSectionText(body.substring(endStmtPrev + 1, begStmt), funcText);
                            var blockText = body.substring(blockMarkerEnd + 1, blockEnd);
                            if (blockType == "cdata") {
                                emitText(blockText, funcText)
                            } else {
                                if (blockType == "minify") {
                                    emitText(scrubWhiteSpace(blockText), funcText)
                                } else {
                                    if (blockType == "eval") {
                                        if (blockText != null && blockText.length > 0) {
                                            funcText.push("_OUT.write( (function() { " + blockText + " })() );")
                                        }
                                    }
                                }
                            }
                            begStmt = endStmtPrev = blockEnd + blockMarker.length - 1
                        }
                    }
                } else {
                    if (body.charAt(begStmt - 1) != "$" && body.charAt(begStmt - 1) != "\\") {
                        var offset = (body.charAt(begStmt + 1) == "/" ? 2 : 1);
                        if (body.substring(begStmt + offset, begStmt + 10 + offset).search(TrimPath.parseTemplate_etc.statementTag) == 0) {
                            break
                        }
                    }
                }
                begStmt = body.indexOf("{", begStmt + 1)
            }
            if (begStmt < 0) {
                break
            }
            var endStmt = body.indexOf("}", begStmt + 1);
            if (endStmt < 0) {
                break
            }
            emitSectionText(body.substring(endStmtPrev + 1, begStmt), funcText);
            emitStatement(body.substring(begStmt, endStmt + 1), state, funcText, tmplName, etc);
            endStmtPrev = endStmt
        }
        emitSectionText(body.substring(endStmtPrev + 1), funcText);
        if (state.stack.length != 0) {
            throw new etc.ParseError(tmplName, state.line, "unclosed, unmatched statement(s): " + state.stack.join(","))
        }
        funcText.push("}}; TrimPath_Template_TEMP");
        return funcText.join("")
    };
    var emitStatement = function(stmtStr, state, funcText, tmplName, etc) {
        var parts = stmtStr.slice(1, -1).split(" ");
        var stmt = etc.statementDef[parts[0]];
        if (stmt == null) {
            emitSectionText(stmtStr, funcText);
            return
        }
        if (stmt.delta < 0) {
            if (state.stack.length <= 0) {
                throw new etc.ParseError(tmplName, state.line, "close tag does not match any previous statement: " + stmtStr)
            }
            state.stack.pop()
        }
        if (stmt.delta > 0) {
            state.stack.push(stmtStr)
        }
        if (stmt.paramMin != null && stmt.paramMin >= parts.length) {
            throw new etc.ParseError(tmplName, state.line, "statement needs more parameters: " + stmtStr)
        }
        if (stmt.prefixFunc != null) {
            funcText.push(stmt.prefixFunc(parts, state, tmplName, etc))
        } else {
            funcText.push(stmt.prefix)
        }
        if (stmt.suffix != null) {
            if (parts.length <= 1) {
                if (stmt.paramDefault != null) {
                    funcText.push(stmt.paramDefault)
                }
            } else {
                for (var i = 1; i < parts.length; i++) {
                    if (i > 1) {
                        funcText.push(" ")
                    }
                    funcText.push(parts[i])
                }
            }
            funcText.push(stmt.suffix)
        }
    };
    var emitSectionText = function(text, funcText) {
        if (text.length <= 0) {
            return
        }
        var nlPrefix = 0;
        var nlSuffix = text.length - 1;
        while (nlPrefix < text.length && (text.charAt(nlPrefix) == "\n")) {
            nlPrefix++
        }
        while (nlSuffix >= 0 && (text.charAt(nlSuffix) == " " || text.charAt(nlSuffix) == "\t")) {
            nlSuffix--
        }
        if (nlSuffix < nlPrefix) {
            nlSuffix = nlPrefix
        }
        if (nlPrefix > 0) {
            funcText.push('if (_FLAGS.keepWhitespace == true) _OUT.write("');
            var s = text.substring(0, nlPrefix).replace("\n", "\\n");
            if (s.charAt(s.length - 1) == "\n") {
                s = s.substring(0, s.length - 1)
            }
            funcText.push(s);
            funcText.push('");')
        }
        var lines = text.substring(nlPrefix, nlSuffix + 1).split("\n");
        for (var i = 0; i < lines.length; i++) {
            emitSectionTextLine(lines[i], funcText);
            if (i < lines.length - 1) {
                funcText.push('_OUT.write("\\n");\n')
            }
        }
        if (nlSuffix + 1 < text.length) {
            funcText.push('if (_FLAGS.keepWhitespace == true) _OUT.write("');
            var s = text.substring(nlSuffix + 1).replace("\n", "\\n");
            if (s.charAt(s.length - 1) == "\n") {
                s = s.substring(0, s.length - 1)
            }
            funcText.push(s);
            funcText.push('");')
        }
    };
    var emitSectionTextLine = function(line, funcText) {
        var endMarkPrev = "}";
        var endExprPrev = -1;
        while (endExprPrev + endMarkPrev.length < line.length) {
            var begMark = "${",
                endMark = "}";
            var begExpr = line.indexOf(begMark, endExprPrev + endMarkPrev.length);
            if (begExpr < 0) {
                break
            }
            if (line.charAt(begExpr + 2) == "%") {
                begMark = "${%";
                endMark = "%}"
            }
            var endExpr = line.indexOf(endMark, begExpr + begMark.length);
            if (endExpr < 0) {
                break
            }
            emitText(line.substring(endExprPrev + endMarkPrev.length, begExpr), funcText);
            var exprArr = line.substring(begExpr + begMark.length, endExpr).replace(/\|\|/g, "#@@#").split("|");
            for (var k in exprArr) {
                if (exprArr[k].replace) {
                    exprArr[k] = exprArr[k].replace(/#@@#/g, "||")
                }
            }
            funcText.push("_OUT.write(");
            emitExpression(exprArr, exprArr.length - 1, funcText);
            funcText.push(");");
            endExprPrev = endExpr;
            endMarkPrev = endMark
        }
        emitText(line.substring(endExprPrev + endMarkPrev.length), funcText)
    };
    var emitText = function(text, funcText) {
        if (text == null || text.length <= 0) {
            return
        }
        text = text.replace(/\\/g, "\\\\");
        text = text.replace(/\n/g, "\\n");
        text = text.replace(/"/g, '\\"');
        funcText.push('_OUT.write("');
        funcText.push(text);
        funcText.push('");')
    };
    var emitExpression = function(exprArr, index, funcText) {
        var expr = exprArr[index];
        if (index <= 0) {
            funcText.push(expr);
            return
        }
        var parts = expr.split(":");
        funcText.push('_MODIFIERS["');
        funcText.push(parts[0]);
        funcText.push('"](');
        emitExpression(exprArr, index - 1, funcText);
        if (parts.length > 1) {
            funcText.push(",");
            funcText.push(parts[1])
        }
        funcText.push(")")
    };
    var cleanWhiteSpace = function(result) {
        result = result.replace(/\t/g, "    ");
        result = result.replace(/\r\n/g, "\n");
        result = result.replace(/\r/g, "\n");
        result = result.replace(/^(\s*\S*(\s+\S+)*)\s*$/, "$1");
        return result
    };
    var scrubWhiteSpace = function(result) {
        result = result.replace(/^\s+/g, "");
        result = result.replace(/\s+$/g, "");
        result = result.replace(/\s+/g, " ");
        result = result.replace(/^(\s*\S*(\s+\S+)*)\s*$/, "$1");
        return result
    };
    TrimPath.parseDOMTemplate = function(elementId, optDocument, optEtc) {
        if (optDocument == null) {
            optDocument = document
        }
        var element = optDocument.getElementById(elementId);
        var content = element.value;
        if (content == null) {
            content = element.innerHTML
        }
        content = content.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
        return TrimPath.parseTemplate(content, elementId, optEtc)
    };
    TrimPath.processDOMTemplate = function(elementId, context, optFlags, optDocument, optEtc) {
        return TrimPath.parseDOMTemplate(elementId, optDocument, optEtc).process(context, optFlags)
    }
})();
/*
 *	Customized durl creator 
 */
var Durl = {
    _callback: null,
    makeShort: function(targetUrl, callback) {
        if (!callback) return;
        this._callback = callback;
        daum.load("http://durl.me/api/Create.do?type=json&callback=Durl.getResult&longurl=" + encodeURIComponent(targetUrl));
    },
    getResult: function(res) {
        if (res.status != "ok") {
            this._callback(false);
        } else {
            this._callback(res.shortUrl);
        }
    }
};

