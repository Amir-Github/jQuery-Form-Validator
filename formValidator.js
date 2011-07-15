/**
 *
 *
 * @author Amir Sadrinia
 * @date 2011-04-13
 */
 (function($){
    
  var tipFrame = '<div class="tinyTip"><div class="content"></div><div class="bottom">&nbsp;</div></div>';		
  var animSpeed = 400;  
    
  function trim(el) {
    return (''.trim) ? el.val().trim() : $.trim(el.val());
  }
  
  $.fn.validate = function (params , userFunc) {
    var fields = [], item;
    $('body').append(tipFrame);
	var tinyTip = $('div.tinyTip');
	tinyTip.hide();	
    
    
    function showTooltip(error , field) {    	
		$('.tinyTip .content').html("<span>"+error+"</span>");
			
		var yOffset = tinyTip.height() + 12;
		var xOffset = (((tinyTip.width() - 10) / 2)) - ($(field).width() / 2);
		
		var pos = $(field).offset();
		var nPos = pos;
			
		nPos.top = pos.top - yOffset;
		nPos.left = pos.left - xOffset;
			
		tinyTip.css('position', 'absolute').css('z-index', '1000');
		tinyTip.css(nPos).fadeIn(animSpeed);  
    }    
    
    function hideTooltip(){
       $('div.tinyTip').fadeOut(animSpeed, function() {}); 
    }
    
    function showError(msg) {
      $("#errorsDiv").css("display" , "block").html("<span>"+msg+"</span>");
    }
    
    function hideError(error) {
      $("#errorsDiv").css("display" , "none").html("");
    }
    
    function handleSubmit() {
      var errors = false, i, l;
      for (i = 0, l = fields.length; i < l; i++) {
        if (!fields[i].testValid(true)) {
          errors = true;
          break;
        }
      }
      if (errors){
        window.scrollTo(0,0);
        return false;
      }  
     if(userFunc && isFunction(userFunc))
      return userFunc();
       
     return true;
    }
    
    function isFunction (obj) {
      return !!(obj && obj.constructor && obj.call && obj.apply);
    }
    
    function processField(opts, selector) {
      var field = $(selector);          
      fields.push(field);    
        
      ////add the required script for the pop-up date selector  
      if(opts.dateFormat) {
        var val = field.val();
        field.datepicker({ dateFormat: 'dd-mm-yy'});   
        field.attr("readonly" , "true");
        if(opts.future)
         field.datepicker( "option", "minDate", new Date());
        if(opts.past)
         field.datepicker("option" , "maxDate", new Date()); 
         
        field.val(val);  ////to make sure we wont lose the value
      }      
      ////add notice or sub-text to the field if required
      if(opts.notice || opts.subtext){
        var n = opts.notice ? opts.notice : opts.subtext;
        var offset = field.position();
        var width  = field.width();  
        
        if(opts.notice)   
         field.after("<div class='title_notice' style='left:"+offset.left+"px;width:"+width+"px'><span class='bold'>"+n.title
                     +(n.description.length >0 ? " - </span><span class='subtext'>"+n.description : "")+"</span></div>");
        else  
         field.after("<div class='sub_text' style='left:"+offset.left+"px;width:"+width+"px'>"+n+"</div>"); 
      }
       
      ////add more-info pop-up if required
      if(opts.moreInfo){
        var content  = (opts.moreInfo.content ? opts.moreInfo.content : opts.moreInfo); //to handle both string and JSON
        var position = (opts.moreInfo.position ? opts.moreInfo.position : 'right');
        
        var boxId = field.attr("id")+"_moreInfo";
        var moreInfo = $("<a class='moreInfoLink'>More Info </a>")
                        .mouseover(function(event) {$("#"+boxId).css("display","inline");})
                        .mouseout(function(event) {$("#"+boxId).css("display","none");});
                         
        field.prev(("label"))
             .append( position == 'below' ?  $("<div />").html(moreInfo) : moreInfo)
             .append("<span id='"+boxId+"' class='moreInfoBox' style='display:none'>"+content+"</span>");
      }  
    
      field.testValid = function (submit) {
        
        var error = {
          message: isFunction(opts.message) ? opts.message.call() : opts.message ,
          isInline: opts.inlineError ,
          id : selector.slice(1) + '_error'
        };
        var val,
          el = $(this),
          gotFunc,
          anyError = false,
          required = opts.required,
          password = (field.attr('type') === 'password'),
          arg = isFunction(opts.arg) ? opts.arg() : opts.arg;
        
        var isSelect = field.is("select");
        
        // trim it
        if (!opts.trim && !password) {
          val = trim(el);
        }  else {
          val = el.val();
        }
         // write it back to the field
         el.val(val);    
         // get the value
         
        gotFunc = ((val.length > 0 || required === 'sometimes') && isFunction(opts.validator));
        // check if we've got an error on our hands
        if (submit === true && required === true && (isSelect ? val == "" : val.length === 0)) {
          anyError = true;
        } else if (gotFunc) {
          anyError = !opts.validator(val, arg);
        }
        
        if (anyError) {
          if(error.isInline){
            showTooltip(error.message, field);  
          } 
          else
           showError(error.message);  
             
          return false;
        } 
        else {
          if(error.isInline)  
            hideTooltip();
          else
            hideError();  
          
          return true;
        }
      };
      ////Bind an alternative event to the field if available
      if(opts.event) field.bind(opts.event, field.testValid);
      
    }///// End of processField()
  
    _(params).each(function(value , key) {processField(value,key)});
    
    this.bind('submit', handleSubmit);
  };
})(this.jQuery);

//////////////Predefined validators
_.mixin({    
  phone: function (val) {
    return /^[0-9]{2}[0-9]{8}$/.test(val);
  }, 
  email: function (val) {
    return /^(?:\w+\.?)*\w+@(?:\w+\.)+\w+$/.test(val);
  },
  url: function (val) {
    return /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/.test(val);
  }, 
  minLength: function (val, length) {
    return val.length >= length;
  },
  maxLength: function (val, length) {
    return val.length <= length;
  },
  image: function (val) {
    return (/^(.)+(jpg|jpeg|png|gif|bmp)$/i).test(val); 
  },
  zipcode: function(val){
    return /[0-9]{4}]/.test(val);
  },
  equal: function (val1, val2) {
    return (val1 == val2);
  },
  numeric: function(val){
    return (val - 0) == val && val.length > 0;
  },
  minAmount: function (val , minValue){
    return _.numeric(val) && val >= minValue; 
  },
  maxAmount: function(val , maxValue){
    return _.numeric(val) && val <= maxValue;
  }
  
});

