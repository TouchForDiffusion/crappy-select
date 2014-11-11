(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else if (typeof exports === "object") {
        module.exports = factory();
    } else {
        root.TagSelector = factory();
    }
}(this, function () {

/*
"<div class='tag-selector-holder {{hideOnMobile}}'>"
        , "<div class='tag-selector-selected'></div>"
        , "<div class='tag-selector-selected-more'>"
          , "<div class='tag-selector-more-counter'></div>"
          , "<div class='tag-selector-more-tags'></div>"
          , "<div class='tag-selector-more-hide'>{{less.tags}}</div>"
        , "</div>"
        , "<div class='tag-selector-input-holder'>"
          , "<input type='text' class='tag-selector-select-input' placeholder='{{tag.add}}'>"
        , "</div>"
        , "<button class='tag-selector-suggestion-toggle'></button>"
      , "</div>"
      , "<div class='tag-selector-dropdown'></ul>"
        , "<ul class='tag-selector-suggestion'></ul>"
        , "<div class='tag-selector-no-exact-match hide'>"
          , "<div class='message'></div>"
          , "<button class='tag-selector-no-exact-match-button'>{{tag.add.button}}</button>"
        , "</div>"
      , "</div>"
      , "<div class='tag-selector-add-new {{hideOnDesktop}}'>"
        , "<input type='text' class='tag-selector-add-new-input' placeholder='{{tag.create}}'>"
        , "<button class='tag-selector-add-new-validate'>{{tag.add.button}}</button>"
    , "</div>"
*/

  var tagsTemplate = function(args) {
    return "<div class='tag-selector-holder " + args["hideOnMobile"] + "'>" +
              "<div class='tag-selector-selected'></div>" +
              "<div class='tag-selector-selected-more'>" +
                "<div class='tag-selector-more-counter'></div>" +
                "<div class='tag-selector-more-tags'></div>" +
                "<div class='tag-selector-more-hide'>" + args["less.tags"] + "</div>" +
              "</div>" +
              "<div class='tag-selector-input-holder'>" +
                "<input type='text' class='tag-selector-select-input' placeholder='" + args["tag.add"] + "'>" +
              "</div>" +
              "<button class='tag-selector-suggestion-toggle'></button>" +
            "</div>" +
            "<div class='tag-selector-dropdown'></ul>" +
                "<ul class='tag-selector-suggestion'></ul>" +
                "<div class='tag-selector-no-exact-match hide'>" +
                  "<div class='message'></div>" +
                  "<button class='tag-selector-no-exact-match-button'>" + args["tag.add.button"] + "</button>" +
                "</div>" +
            "</div>" +
            "<div class='tag-selector-add-new " + args["hideOnDesktop"] + "'>" +
              "<input type='text' class='tag-selector-add-new-input' placeholder='" + args["tag.create"] + "'>" +
              "<button class='tag-selector-add-new-validate'>" + args["tag.add.button"] + "</button>" +
            "</div>" +
          "</div>"
  }

  // Generate unique id (http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript)
  var guid = (function() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
                 .toString(16)
                 .substring(1);
    }
    return function() {
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
             s4() + '-' + s4() + s4() + s4();
    };
  })();

  function trigger(el, name) {
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent(name, false, true);
    el.dispatchEvent(evt);
  }
    
  function isTouchDevice() {
    if (undefined === this.isTouch) {
      var isTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints
      if (isTouch === undefined) {
        this.isTouch = false
      } else {
        this.isTouch = true
      }
    }
    return this.isTouch
  }

  function createSelect(datas) {
    var el = document.createElement("select")
      , frag = document.createDocumentFragment()

    datas.forEach(function (item) {
      var option = document.createElement("option")
      option.value = item.value
      option.text = item.text
      if (undefined !== item.selected && item.selected === true) {
        option.selected = true
      }
      frag.appendChild(option)
    })

    el.multiple = true
    el.appendChild(frag.cloneNode(true))

    return el
  }

  function merge(obj1,obj2){
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
  }

  // TagSelector constructor
  var TagSelector = function(options) {

    var self = this
      , hideOnMobileClass = "hide"
      , hideOnDesktopClass = "hide" 

    options = options || {}

    options.i18n = merge({
        "tag.add": "add tags"
      , "tag.create": "create a new tag"
      , "tag.add.button": "add"
      , "more.tags.counter.singular": "%num% more tag..."
      , "more.tags.counter": "%num% more tags..."
      , "less.tags": "show less tags..."
      , "no.exact.match": "no exact match found for <strong>{{value}}</strong>, <br> would you like to create it?"
    }, options.i18n || {})

    options.tagToShow  = options.tagToShow || -1;
    options.template = options.template || tagsTemplate
    
    if(!options.itemMinLength) {
      options.itemMinLength = 3
    }
    
    if (!isTouchDevice()) {
      hideOnMobileClass = "show"
    } 
    else {
      hideOnDesktopClass = "show"
    }

    this.widget = document.createElement("div")
    this.widget.className = "tag-selector"
    this.widget.innerHTML = options.template(merge(options.i18n, {
        hideOnMobile: hideOnMobileClass
      , hideOnDesktop: hideOnDesktopClass
    }))

    this.options = options
    this.mouseOver = false
    this.datas = options.datas
    this.el = createSelect(this.datas)

    if (hideOnDesktopClass === "hide") {
      this.el.style.display = "none"
    }
    
    // DOM references
    this.searchInput = this.widget.querySelectorAll(".tag-selector-select-input")[0]
    this.suggestionToggleButton = this.widget.querySelectorAll(".tag-selector-suggestion-toggle")[0]
    this.selectedList = this.widget.querySelectorAll(".tag-selector-selected")[0]
    this.suggestionList = this.widget.querySelectorAll(".tag-selector-suggestion")[0]
    this.addNewTermButton = this.widget.querySelectorAll(".tag-selector-add-new-validate")[0]
    this.addNewTermInput = this.widget.querySelectorAll(".tag-selector-add-new-input")[0]
    this.noExactMatchWrapper = this.widget.querySelectorAll(".tag-selector-no-exact-match")[0]
    this.noExactMatchMessage = this.widget.querySelectorAll(".tag-selector-no-exact-match > .message")[0]
    this.noExactMatchButton = this.widget.querySelectorAll(".tag-selector-no-exact-match-button")[0]
    this.moreTagsHolder = this.widget.querySelector(".tag-selector-selected-more")
    this.moreTagsCounter = this.widget.querySelector(".tag-selector-more-counter")
    this.moreTagsTags = this.widget.querySelector(".tag-selector-more-tags")
    this.moreTagsHide = this.widget.querySelector(".tag-selector-more-hide")

    this.moreTagsTags.style.display = "none"
    this.moreTagsHide.style.display = "none"
    
    // EventListeners
    this.events = {
        onChange: this.onChange.bind(this)
      , onWidgetFocus: this.onWidgetFocus.bind(this)
      , onFocusEvents: this.onFocusEvents.bind(this)
      , onSearch: this.onSearch.bind(this)
      , onSelected: this.onSelected.bind(this)
      , onExactMatchButton: this.onExactMatchButton.bind(this)
      , updateSelectedList: this.updateSelectedList.bind(this)
      , onRemoveSelectedTerm: this.onRemoveSelectedTerm.bind(this)
      , onToggleSuggestion: this.onToggleSuggestion.bind(this)
      , onAddButton: this.onAddButton.bind(this)
      , onAddInput: this.onAddInput.bind(this)
      , onMoreTagsClick: this.onMoreTagsClick.bind(this)
      , onHideMoreTagsClick: this.onHideMoreTagsClick.bind(this)
    }

    this.attachEvents()
    this.updateSelectedList()
  }

  TagSelector.prototype = {

      attachEvents: function(enableOnly) {
        enableOnly = enableOnly || false
        this.el.addEventListener("change", this.events.onChange, false)
        this.widget.addEventListener("click", this.events.onWidgetFocus, false)
        if (!isTouchDevice()) {
          this.searchInput.addEventListener("blur", this.events.onFocusEvents, false)
          this.searchInput.addEventListener("focus", this.events.onFocusEvents, false)
          this.widget.addEventListener("mouseenter", this.events.onFocusEvents, false)
          this.widget.addEventListener("mouseleave", this.events.onFocusEvents, false)
          this.searchInput.addEventListener("keyup", this.events.onSearch, false)
          this.suggestionList.addEventListener("click", this.events.onSelected, false)
          this.noExactMatchButton.addEventListener("click", this.events.onExactMatchButton, false)
          this.el.addEventListener("change:selection", this.events.updateSelectedList, false)
          this.moreTagsTags.addEventListener("click", this.events.onRemoveSelectedTerm, false)
          this.selectedList.addEventListener("click", this.events.onRemoveSelectedTerm, false)
          this.suggestionToggleButton.addEventListener("click", this.events.onToggleSuggestion, false)
          if (enableOnly === false) {
            this.moreTagsCounter.addEventListener("click", this.events.onMoreTagsClick, false)
            this.moreTagsHide.addEventListener("click", this.events.onHideMoreTagsClick, false)
          }
        } else {
          this.addNewTermButton.addEventListener("click", this.events.onAddButton, false)
          this.addNewTermInput.addEventListener("keypress", this.events.onAddInput, false)
        }
      }

    , detachEvents: function(disableOnly) {
        disableOnly = disableOnly || false
        this.el.removeEventListener("change", this.events.onChange, false)
        this.widget.removeEventListener("change", this.events.onWidgetFocus, false)
        if (!isTouchDevice()) {
          this.searchInput.removeEventListener("blur", this.events.onFocusEvents, false)
          this.searchInput.removeEventListener("focus", this.events.onFocusEvents, false)
          this.widget.removeEventListener("mouseenter", this.events.onFocusEvents, false)
          this.widget.removeEventListener("mouseleave", this.events.onFocusEvents, false)
          this.searchInput.removeEventListener("keyup", this.events.onSearch, false)
          this.suggestionList.removeEventListener("click", this.events.onSelected, false)
          this.noExactMatchButton.removeEventListener("click", this.events.onExactMatchButton, false)
          this.el.removeEventListener("change:selection", this.events.updateSelectedList, false)
          this.moreTagsTags.removeEventListener("click", this.events.onRemoveSelectedTerm, false)
          this.selectedList.removeEventListener("click", this.events.onRemoveSelectedTerm, false)
          // keep show/hide more tags alive when enabling and disabling the widget
          if (disableOnly === false) {
            this.moreTagsCounter.removeEventListener("click", this.events.onMoreTagsClick, false)
            this.moreTagsHide.removeEventListener("click", this.events.onHideMoreTagsClick, false)
          }
          this.suggestionToggleButton.removeEventListener("click", this.events.onToggleSuggestion, false)
        } else {
          this.addNewTermButton.removeEventListener("click", this.events.onAddButton, false)
          this.addNewTermInput.removeEventListener("keypress", this.events.onAddInput, false)
        }
      }

    , onMoreTagsClick: function(evt) {
        this.moreTagsCounter.style.display = "none"
        this.moreTagsTags.style.removeProperty("display")
        this.moreTagsHide.style.removeProperty("display")
      }

    , onHideMoreTagsClick: function(evt) {
        this.moreTagsCounter.style.removeProperty("display")
        this.moreTagsTags.style.display = "none"
        this.moreTagsHide.style.display = "none"
      }

    , disable: function() {
        this.widget.classList.add("disabled")
        this.detachEvents(true);
      }

    , enable: function() {
        this.widget.classList.remove("disabled")
        this.attachEvents(true);
      }

    , onWidgetFocus : function(evt) {
        this.searchInput.focus()
      }

    , onFocusEvents: function(evt) {
        if (evt.type === "mouseenter") {
          this.mouseOver = true
        }
        else if (evt.type === "mouseleave") {
          this.mouseOver = false
        }
        else if (evt.type === "blur" && this.mouseOver === false) {
            this.widget.classList.remove("tag-selector-expended")
        }
        else if (evt.type === "focus" && this.mouseOver === true) {
            this.widget.classList.add("tag-selector-expended")
        }
      }
    
    , onChange: function(evt) {
        trigger(this.el, "change:selection")
        this.searchInput.value = ""
      }
    
    , onToggleSuggestion: function(evt) {
        this.suggestionToggleButton.classList.toggle("open")
        if (this.suggestionToggleButton.className.indexOf("open") === -1) {
          this.clearSuggestions()
          // TODO: refactoring needed
          this.suggestionList.classList.remove("show")
        } 
        else {
          this.setSuggestions(this.unselected)
        }
      }
    
    , updateSelectedList: function() {
        
        this.selectedList.innerHTML = ""
        this.moreTagsTags.innerHTML = ""

        var selected = document.createDocumentFragment()
        var more = document.createDocumentFragment()
        var count = 0

        for (var i = this.datas.length - 1; i >= 0; i--) {
          var item = this.datas[i]
          if (undefined !== item.selected && item.selected === true) {
            var el = document.createElement("div")
            el.className = "tag-selector-selected-item"
            el.innerHTML = '<span>' + item.text + "</span><button data-value=\"" + item.value + "\" class=\"unselect-term\">x</button>"
            if (this.options.tagToShow === -1 || count < this.options.tagToShow) {
              selected.appendChild(el)
            }
            else {
              more.appendChild(el)
            }
            count++
          }
        }

        var countMore = more.childNodes.length
        if (countMore > 0) {

          var message = (countMore === 1) 
            ? this.options.i18n["more.tags.counter.singular"]
            : this.options.i18n["more.tags.counter"]

          this.moreTagsHolder.style.removeProperty('display')
          this.moreTagsCounter.innerHTML = message.replace('%num%', more.childNodes.length)
          this.moreTagsTags.appendChild(more.cloneNode(true))
        }
        else {
          this.moreTagsCounter.innerHTML = ""
          this.moreTagsHolder.style.display = "none"
        }

        this.selectedList.appendChild(selected.cloneNode(true))

        // reset states
        this.noExactMatchWrapper.classList.add("hide")
        this.suggestionToggleButton.classList.remove("open")
        this.suggestionList.classList.remove("show")
        this.searchInput.focus()
      }

    , _getItem: function(value) {
        var found = null
        this.datas.forEach(function(item) {
          if (item.value == value) {
            found = item
          }
        })
        return found
      }
    
    , onRemoveSelectedTerm: function(evt) {

        if (evt.target.nodeName !== "BUTTON") {
          return false
        }
        var value = evt.target.getAttribute("data-value")
          , item = this._getItem(value)
        this.selectTerm(item, false)
      }
    
    , onSearch: function(evt) {
        if (evt.keyCode === 13 && this.options.allowCreate) {
          this.createNewItem(this.searchInput.value)
          return true
        } 
        
        var value = evt.target.value
          , matches = this.datas.filter(function(item) {
            var regex = new RegExp(value, "i")
            return ((undefined === item.selected || item.selected === false) && item.text.search(regex) !== -1)
          })

        this.clearSuggestions()
        
        if (!value.length) {
          // close suggestion list when search input is empty
          if (this.suggestionToggleButton.classList.contains("open")) {
            this.onToggleSuggestion()
          }
          return false
        }
        
        if (matches.length) {
          this.setSuggestions(matches)
        }

        if (this.options.allowCreate) {
          this.noExactMatch(value)
        }
        
      }
    
    , onSelected: function(evt) {
        var value = evt.target.getAttribute("data-value")
        this.datas.forEach(function (item) {
          if (value == item.value) {
            this.selectTerm(item, true)
          }
        }.bind(this))
      }
    
    , onAddInput: function(evt) {
        if (evt.keyCode === 13) {
         this.createNewItem(this.addNewTermInput.value)
        }
      }
    
    , onAddButton: function(evt) {
        this.createNewItem(this.addNewTermInput.value)
      }
    
    , onExactMatchButton: function(evt) {
        this.createNewItem(this.searchInput.value)
      }

    , selectItemByValue: function(value, silent) {
        silent = silent || false
        this.datas.forEach(function(item) {
          if (item.value === value) {
            this.selectTerm(item, true, silent)
          }
        }.bind(this))
      }
    
    , selectTerm: function(item, bool, silent) {

        silent = silent || false
        // Delete newly created item
        if (item.isNew && bool === false) {
          for (var i = this.datas.length - 1; i >= 0; i--) {
            if (this.datas[i] === item) {
              this.datas.splice(i, 1)
            }
          }
        } else {
          item.selected = bool
        }

        if (true === bool && undefined !== this.options.onAdd && false === silent) {
          this.options.onAdd.call(this, item)
        }

        if (false === bool && undefined !== this.options.onRemove && false === silent) {
          this.options.onRemove.call(this, item)
        }
        
        this.clearSuggestions()
        trigger(this.el, "change")
      }
    
    , clearSuggestions: function() {
        this.suggestionList.innerHTML = ""
      }
    
    , setSuggestions: function(items) {
        items = items || this.datas
        var frag = document.createDocumentFragment();

        items.forEach(function (item) {
          if (undefined === item.selected || item.selected === false) {
            var li = document.createElement("li")
            li.setAttribute("data-value", item.value)
            li.innerHTML = item.text
            li.className = "term-item"
            frag.appendChild(li)
          }
        })

        this.suggestionList.appendChild(frag.cloneNode(true))
        this.suggestionToggleButton.classList.add("open")
        this.suggestionList.classList.add("show") 
      }
      
    , noExactMatch: function(value) {
        if (this.options.itemMinLength > value.length || this.termExist(value) === true) {
          this.noExactMatchWrapper.classList.add("hide")
          return false
        }
        
        this.noExactMatchMessage.innerHTML = this.options.i18n["no.exact.match"].replace(/{{value}}/g, value)
        this.noExactMatchWrapper.classList.remove("hide")
      }

    , addItem: function(item, silent) {
        silent = silent || false
        var option = document.createElement("option")
            option.text = item.text
            option.value = item.value
            option.selected = item.selected

        if (undefined !== item.isNew) {
          option.setAttribute("data-new", true)
        }

        this.datas.push(item)
        this.el.add(option, this.el[0])

        if (undefined !== this.options.onCreate && silent === false) {
          this.options.onCreate.call(this, item)
        }

        this.selectTerm(item, item.selected, silent)
      }
    
    , createNewItem: function(text) {
        if (this.options.itemMinLength > text.length) {
          // console.log("new term too short")
          return false
        }
        if (this.termExist(text)) {
          // console.log("term already exist")
          return false
        }
        var newItem = {
            value: guid()
          , text: text
          , selected: true
          , isNew: true
        }
        this.addItem(newItem)
      }
    
    , termExist: function(termToCheck) {
        return this.datas.filter(function(item) {
          return item.text === termToCheck
        }).length > 0
      }

    , destroy: function() {
        this.detachEvents()
      }
  }

  return TagSelector
}));