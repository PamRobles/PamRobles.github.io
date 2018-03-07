
/**IRProf.js
 * This script contains the code used by the Browse Personal Profile page
 *      ********* DEPENDENCIES **********
 *  This script content has dependencies with :
 *    - jQuery 1.7.1 (http://jquery.com/)
 *    - jQuery UI 1.8.16 (http://jqueryui.com/)
 *    - IR.js
 *    - jquery-irPager.js (IRIS custom plugin)
 * @author Mauro Ballabio
 * @version 1.0
 *--------------------------------------------------------------------------*/

var IRProf={ // Start IRProf definition
  /*######################################
    ######################################
       ATTRIBUTES DEFINITION'S SECTION
    ######################################
  	######################################
  */ 
  version: '1.0',
  upi                          : null, /* UCL Person Identifier of the researcher whose profile is displayed*/  
  tabsProfile                  : null, /* Variable referring to the main tabs' container*/
  researcherImageEl            : null, /* Reference to the HTML element representing the current image associated to the researcher */
  pubIrPagerEl                 : null, /* Reference to the HTML element representing the Publication pager. It may not exist if there are not items  */
  estIrPagerEl                 : null, /* Reference to the HTML element representing the Esteem pager. It may not exist if there are not items  */
  /*######################################
    ######################################
       FUNCTIONS DEFINITION'S SECTION
    ######################################
    ######################################
  */ 		
  /**
   * Function that initialise the script
   */ 
  init:function(upi,isShowEditProfile,openTabNum) {	

	IRProf.upi                      = upi;
	IRProf.tabsProfile              = $j('#profile #tabsProfile'); 
	IRProf.researcherImageEl        = $j('#profile #profileHeader .rightSide img');   

	/*Transform the appropriate element into tabs using jQuery UI. 
	  1) Set the cache option to true so that a second selection done on a previously selected tab won't perform another call
	  2) Display the tab loading message when a tab is selected
	 */ 
	IRProf.tabsProfile.tabs({
	  cache:true,
	  select: function (e, ui) {
		/* Creating the tab loading message. 
		 * IMPORTANT : having set cache=true just prevent the remote content to be loaded more than once BUT the select event is always called whenever the tab is clicked.
		 * Because of that we need to call the loading message ONLY if there is not content inside the tab using the is(EMPTY) facility
		 */
	    var panelEl = $j(ui.panel);
	    if (panelEl.is(":empty")) {
	      IR.UIUtils.createLoadingMsg(panelEl);
	    }	 
	  }
	});
	
    // Show the tab container as it was set to hidden
	IRProf.tabsProfile.show();
	
	// Handle the section that is rendered when a user can edit a profile 
	if (isShowEditProfile) { // Start if (isShowEditProfile) 
	  var btnEditProfile              = $j('#profile #btnEditProfile'); 	
	  var btnExportProfile            = $j('#profile #btnExportProfile');
	  var exportProfilePopupDialogEl  = $j('#profile #exportProfilePopupDialog');
	  // Transform the appropriate elements into buttons using jQuery UI
	  btnEditProfile.button({extraBaseClass: 'ui-button-iris-button-lighter', icons: {primary:'ui-icon-pencil'}});
	  btnExportProfile.button({extraBaseClass: 'ui-button-iris-button-lighter', icons: {primary:'ui-icon-arrowthickstop-1-s'}});	
	  // Transform the appropriate elements into a simple popup dialog using jQuery UI Dialog 
	  IR.UIUtils.transformIntoSimplePopupDialogEl(exportProfilePopupDialogEl,'Profile Exporting Options');
	  // Attach the opening of the dialog when the Export Profile button is clicked
	  btnExportProfile.bind('click', 
	     function() {exportProfilePopupDialogEl.dialog("open"); }
      );

	} // End if (isShowEditProfile) 

    // Create the frame around the current researcher image if any exist
    IR.UIUtils.createImageFrame(IRProf.researcherImageEl,true);	
    // Initialise the generic boxes in the page (such as the groups and themes in the Main Profile section)
    IR.UIUtils.GenericBox.init();
    // Initialise content for tabsProfileMain which is loadeed by default when the page loads
    IRProf.initTabsProfileMain();
    
    //If openTab has a valid value in it (greater than 0), open the specified tab (the index of the tab is this number minus 1). This parameter can easily be 0 as clients doesn't require to open a tab different from the default one most of the times !
    if (openTabNum > 0)  {
      IRProf.tabsProfile.tabs('select',openTabNum-1);
    }
    
  },
  /**
   * Function that initialise the tab displaying Main Profile Information
   */  
  initTabsProfileMain:function() {
	/*IMPORTANT: when implementing the code please consider that some of the elements may not exist*/  
	  
	/*  Most of the elements to display on TabsProfileMain are optionals according to what a given researcher has edited on his profile.
	    The following lines provvides to adjust the display according to what is there or not
	*/
	var hasBiography         = IRProf.tabsProfile.find('.biography').length?true:false;
	var hasGroupsAndThemes   = IRProf.tabsProfile.find('.groupsAndThemes').length?true:false;
	var hasResSummary        = IRProf.tabsProfile.find('.resSummary').length?true:false;
	var hasTeachSummary      = IRProf.tabsProfile.find('.teachSummary').length?true:false;

	if (hasResSummary && hasTeachSummary) {
	  IRProf.tabsProfile.find('.resSummary').css({'padding-bottom' : '20px','border-bottom' : '1px dotted #CDCDCD'});
	}
	
	if (hasBiography && !hasGroupsAndThemes && (hasResSummary || hasTeachSummary) ) {
	  IRProf.tabsProfile.find('.biography').css({'padding-bottom' : '20px','border-bottom' : '1px dotted #CDCDCD'});		
	}
	
  },
  
  /**
   * Function that initialise the tab displaying Research Activities associated to the profile
   */  
  initTabsProfileAct:function() {
	  /*IMPORTANT: when implementing the code please consider that some of the elements may not exist*/  
    // Handle the click on the list items (just the ones located inside the activity section of this tab)  
	  IRProf.tabsProfile.find("#tabsProfileAct .activitySection ul li").bind('click',
  	  function(e) { 
  	    //IMPORTANT TO AVOID TO CALL THE LINK TWICE: if the click happen on the anchor just exit this function, otherwise the page will be called twice
  	    if ($j(e.target).is('a')) {
  	      return;  
  	    }
  	    var jQThis = $j(this);
  	    var urlToCall = jQThis.find('a').attr('href');
  	    window.location.href = urlToCall;
	    }		  
    );  
	  
		// Automatically call the software URL
  	var softwareSectionEl = IRProf.tabsProfile.find('#tabsProfileAct .softwareSection');
    var dataToSend = {upi:IRProf.upi};
    var requestUrl = IR.pageContextRequestContextPath + "/" + IR.constUrlBrowseProfileSoftware;
    $j.ajax({
     	url: requestUrl,
     	type: 'POST',
     	dataType : 'html',
      data:dataToSend,
      error: function(jqXHR) {
        // Do nothing; the whole functionality need to be transparent as most of the users do not have software. So visual errors from the RSD Dashboard servers should not be notified as they do not interest most of the users.
      	// It's only be a problem under a development / tester point of view because it's harder to see if there are errors (anyway they are logged on files)
      	//alert("an error has raised");
      },
      success: function(data) {
      	if ($j(data).find('.header').length) {
      		softwareSectionEl.html(data);
      		softwareSectionEl.removeClass('hide');
      	  /* Bind the behaviour to open/close a software item detail on a click: remember that the element is option and it might not exist*/  
      	  IRProf.tabsProfile.find('#tabsProfileAct .softwareSection .softwareItemsContainer ul.softwareItems li.softwareItem .softwareItemMainContent .leftSide .detailImgContainer .showDetail').bind('click',  
            function(e) {
              var jQThis = $j(this);
      	      var imgSrc = IR.pageContextRequestContextPath+"/"+IR.constImgDir+"/icon/";
      	      var imgTitleAndAlt= null;
      	      // Get a reference to the associated detail by walking back to the LI that contains the selected image and then get the detail
  		        var detail = jQThis.parent().parent().parent().parent().find('.detail');
  		        if (detail.hasClass('hide')) {
  		        	detail.removeClass('hide');
  			        imgSrc = imgSrc + 'icon_minus2.png';
  			        imgTitleAndAlt = "Hide detail";
  			  		} else {
  			  			detail.addClass('hide');
  			  			imgSrc = imgSrc + 'icon_plus2.png';
  			  			imgTitleAndAlt = "View detail";
  			  		}
  			  		jQThis.attr('src',imgSrc);
  			  	  jQThis.attr('title',imgTitleAndAlt);
  			  		jQThis.attr('alt',imgTitleAndAlt);
  			  	}		  
      	  );  
      	}

      }
    });
	  
  },
  
  /**
   * Function that initialise the tab displaying Fundings associated to the profile.
   * IMPORTANT: this tab is not always created in the page (it depends if the user has logged in)
   */  
  initTabsProfileFund:function(isLoggedIn) {
	if (!isLoggedIn) {
	  return;	
	}  
	//Check if the tab exist in the page as it is not always created 
	if (IRProf.tabsProfile.find("#tabsProfileFund").length) { // Begin IF (IRProf.tabsProfile.find("#tabsProfileFund").length)
	  /* Bind the behaviour to open/close a funding/project detail on a click*/  
	  IRProf.tabsProfile.find("#tabsProfileFund .section .groupedFundingOrProject .fundingOrProjects ul li .header .leftSide .leftSideLeft img, #tabsProfileFund .section .groupedFundingOrProject .fundingOrProjects ul li .header .leftSide .leftSideRight").bind('click',  
  	    function(e) {
		  var imgSrc = IR.pageContextRequestContextPath+"/"+IR.constImgDir+"/icon/";
		  var jQThis = $j(this);
		  var detailEl;
		  var imgEl;
		  // Get a reference of the image element to change according to what element was clicked
		  if ($j(e.target).is('img')) {
		    imgEl = jQThis;
		    detailEl = jQThis.parent().parent().parent().parent().find(".detail");
		  } else {
	        imgEl = jQThis.prev().find('img');
	        detailEl = jQThis.parent().parent().parent().find(".detail");
	  	  }	
		  if (detailEl.hasClass("hide")) {
			detailEl.removeClass("hide");
		    imgSrc = imgSrc + "icon_minus2.png";
		  } else {
			detailEl.addClass("hide");
		    imgSrc = imgSrc + "icon_plus2.png";
		  }
		  imgEl.attr('src',imgSrc);
	    }		  
	  );  
	}  // End IF (IRProf.tabsProfile.find("#tabsProfileFund").length)
	  
  },  
  
  /**
   * Function that initialise the tab displaying Students associated to the profile.
   * IMPORTANT: this tab is not always created in the page (it depends if the user has logged in)
   */  
  initTabsProfileStud:function(isLoggedIn) {
	if (!isLoggedIn) {
	  return;	
	}  
	//Check if the tab exist in the page as it is not always created 
	if (IRProf.tabsProfile.find("#tabsProfileStud").length) { // Begin IF (IRProf.tabsProfile.find("#tabsProfileStud").length)
	  /*IMPORTANT: when implementing the code please consider that some of the elements may not exist*/  
	  /* Bind the behaviour to open/close student detail on a click*/  
	  IRProf.tabsProfile.find("#tabsProfileStud .profileStudentsBox .header img, #tabsProfileStud .profileStudentsBox .header .fakeLink").bind('click',  
  	    function(e) {
		  var imgSrc = IR.pageContextRequestContextPath+"/"+IR.constImgDir+"/icon/";
		  var jQThis = $j(this);
		  var studentInfoEl = jQThis.parent().parent().find(".info");
		  var imgEl;
		  // Get a reference of the image element to change according to what element was clicked
		  if ($j(e.target).is('img')) {
		    imgEl = jQThis;
		  } else {
	        imgEl = jQThis.prev();
	  	  }	
		  if (studentInfoEl.hasClass("hide")) {
		    studentInfoEl.removeClass("hide");
		    imgSrc = imgSrc + "icon_minus2.png";
		  } else {
		    studentInfoEl.addClass("hide");
		    imgSrc = imgSrc + "icon_plus2.png";
		  }
		  imgEl.attr('src',imgSrc);
	    }		  
	  );  
	}  // End IF (IRProf.tabsProfile.find("#tabsProfileStud").length)
	  
  },  
  
  /**
   * Function that initialise the tab displaying Esteems and Memberships associated to the profile
   */  
  initTabsProfileEst:function() {
	/*IMPORTANT: when implementing the code please consider that some of the elements may not exist*/  
	IRProf.estIrPagerEl = IRProf.tabsProfile.find("#tabsProfileEst #estIrPager");
    //If the pager element exist run the pager plugin to make a proper pager of it
    if (IRProf.estIrPagerEl.length) {
  	  /************************************************************************************************************
  	   *  Handling the image that will show more detail for a given entry.
  	  ************************************************************************************************************/
        // The items on the page can change when using the Pager; this will recreate the items via Ajax. Because of that we don't get a reference to the items
        // in a jQuery object but we rather pass the selector, so the new elements will be taken into consideration if the pager is used. The trick is to use the on() function on an element
        // that will always present on the page and give the selector as argument to it
    	IRProf.estIrPagerEl.on('click','.showDetail', 
    	  function() {
            var jQThis = $j(this);
      	    var imgSrc = IR.pageContextRequestContextPath+"/"+IR.constImgDir+"/icon/";
      	    var imgTitleAndAlt= null;
      	    // Lets walk back to the TR of the clicked image and ask for the next element which is the hidden TR with the extra fields 
  		    var trDetail = jQThis.parent().parent().parent().parent().next();
  		    if (trDetail.hasClass('hide')) {
  		      trDetail.removeClass('hide');
  			  imgSrc = imgSrc + 'icon_minus2.png';
  			  imgTitleAndAlt = "Hide detail";
  		    } else {
  			  trDetail.addClass('hide');
  			  imgSrc = imgSrc + 'icon_plus2.png';
  			  imgTitleAndAlt = "View detail";
  		    }
  		    jQThis.attr('src',imgSrc);
  		    jQThis.attr('title',imgTitleAndAlt);
  		    jQThis.attr('alt',imgTitleAndAlt);
  		  }
        );	
      // Create the correct URL by adding the context path and putting the upi as initial parameter 
      var requestURL = IR.pageContextRequestContextPath + "/" + IR.constUrlBrowseProfileEsteemsPaged + "?upi="+IRProf.upi;
      //Run the plugin to create the pager
      var opts = {itemsDesc:'Achievements'};
      IRProf.estIrPagerEl.irPager(requestURL,opts);	
    }
  },
  
  /**
   * Function that initialise the tab displaying Publications associated to the profile
   */  
  initTabsProfilePub:function() {
	/*IMPORTANT: when implementing the code please consider that some of the elements may not exist*/  
	IRProf.pubIrPagerEl = IRProf.tabsProfile.find("#tabsProfilePub #pubIrPager");
    //If the pager element exist run the pager plugin to make a proper pager of it
    if (IRProf.pubIrPagerEl.length) {
      // Create the correct URL by adding the context path and putting the upi as initial parameter 
      var requestURL = IR.pageContextRequestContextPath + "/" + IR.constUrlBrowseProfilePublicationsPaged + "?upi="+IRProf.upi;
      //Run the plugin to create the pager
      var opts = {itemsDesc:'Publications'};
      IRProf.pubIrPagerEl.irPager(requestURL,opts);	
    }
  }    
  
  
}; // End IRProf definition