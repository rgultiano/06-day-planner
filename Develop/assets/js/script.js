const TIME_PAST = 0;
const TIME_PRESENT = 1;
const TIME_FUTURE = 2;

const TIMZEONE = "Australia/Melbourne";

//set start and end of day constants for the planner using 24 hours
const START_OF_DAY = "9:00 AM";
const END_OF_DAY = "11:00 PM";
const TIME_OF_DAY_FORMAT = "h:mm A"; // moment format for *_OF_DAY constants
const PLANNER_SAVE_FORMAT = 'x';
const PLANNER_DISPLAY_FORMAT = "h:mm A"; //note this is not included in the checkAndHandleConfig() check as it's simply visual

const TIME_BLOCK_INTERVAL = 60; // time block interval
const TIME_BLOCK_INTERVAL_UNIT = 'minutes';

const MOMENT_NOW = moment(); // time when script is loaded

// local storage config vars

const LS_CONFIG_NAME = 'dayplanner_config';
const LS_PLANNER_DATA = 'dayplanner_data';

// global var to store planner_data within client memory
var planner_data = {};

// set a config_check variable to prevent constant checking of config
var config_checked = false;


// HTML and CSS constants

const BG_CLASS_PAST = 'bg-danger';
const BG_CLASS_PRESENT = 'bg-info';
const BG_CLASS_FUTURE = 'bg-success';

const divTimeblocks = $("#timeblocks");



// function that handles any config changes
function checkAndHandleConfig(){
    if(!config_checked){
        // NOTE: The current implementation is rudementary
        // If the config doesn't match the saved config, it will delete ALL data
        // this can and should be updated in any production ready implementaiton
        // e.g. You can using hashing of config to save data for recovery/rollback/migration purposes
        const config = JSON.parse(window.localStorage.getItem(LS_CONFIG_NAME));
        if(
            config &&
            config.hasOwnProperty('START_OF_DAY') &&
            config.START_OF_DAY === START_OF_DAY &&
            config.hasOwnProperty('END_OF_DAY') &&
            config.END_OF_DAY === END_OF_DAY &&
            config.hasOwnProperty('TIME_OF_DAY_FORMAT') &&
            config.TIME_OF_DAY_FORMAT === TIME_OF_DAY_FORMAT &&
            config.hasOwnProperty('TIME_BLOCK_INTERVAL') &&
            config.TIME_BLOCK_INTERVAL === TIME_BLOCK_INTERVAL &&
            config.hasOwnProperty('TIME_BLOCK_INTERVAL_UNIT') &&
            config.TIME_BLOCK_INTERVAL_UNIT === TIME_BLOCK_INTERVAL_UNIT &&
            config.hasOwnProperty('PLANNER_SAVE_FORMAT') &&
            config.PLANNER_SAVE_FORMAT === PLANNER_SAVE_FORMAT
        ){
            // config matches previous config
            // current imp load the planner_data
            // probably not necessary, but a nice place to add this to be loaded once.
            planner_data = JSON.parse(window.localStorage.getItem(LS_PLANNER_DATA));
            console.log('CONFIG UNCHANGED');
        } else{
            console.log('WARNING: CONFIG CHANGED');
            // config doesn't match previous config
            // current imp: delete storage
            window.localStorage.removeItem(LS_CONFIG_NAME);
            window.localStorage.removeItem(LS_PLANNER_DATA);

            // Save current config
            let curr_config = {};
            curr_config.START_OF_DAY = START_OF_DAY;
            curr_config.END_OF_DAY = END_OF_DAY;
            curr_config.TIME_OF_DAY_FORMAT = TIME_OF_DAY_FORMAT;
            curr_config.TIME_BLOCK_INTERVAL = TIME_BLOCK_INTERVAL;
            curr_config.TIME_BLOCK_INTERVAL_UNIT = TIME_BLOCK_INTERVAL_UNIT;
            curr_config.PLANNER_SAVE_FORMAT = PLANNER_SAVE_FORMAT;
            window.localStorage.setItem(LS_CONFIG_NAME, JSON.stringify(curr_config));

            // save a blank planner data object
            planner_data = {};
            window.localStorage.setItem(LS_PLANNER_DATA, JSON.stringify(planner_data));
        }

        config_checked = true;
    }
    
}

function generateTimeblocks(start_string, end_string, format){
    /*
     * provide inputs to function for easy maintenance and extension
     * in the case of wanting to add multi day support
     */
    const start = moment(start_string, format);
    const end = moment(end_string, format);
    // iterate through timeblocks from the start of day to the end of day
    while(start.isBefore(end)){
        // check and handle any possibel config changes
        // this should prevent any anomolies due to changes in key config variables
        // this should also load the planner_data
        checkAndHandleConfig();
        //console.log('now: ', MOMENT_NOW.format(), ' || start: ', start.format(), ' || moment(): ',start.clone().add(TIME_BLOCK_INTERVAL, TIME_BLOCK_INTERVAL_UNIT).format())

        let time_relevance = -1;
        switch(true){
            case (start.isBefore(MOMENT_NOW) && start.clone().add(TIME_BLOCK_INTERVAL, TIME_BLOCK_INTERVAL_UNIT).isBefore(MOMENT_NOW)):
                // then in the time in the past
                console.log('time in past');
                time_relevance = TIME_PAST;
                break;
            case (start.isAfter(MOMENT_NOW)):
                // then time is in future blocks
                console.log('time in future');
                time_relevance = TIME_FUTURE;
                break;
            default:
                // then time is in the current block
                console.log('time in present');
                time_relevance = TIME_PRESENT;
                break;
        }
        // add a timeblock
        addTimeblock(start, getEventText(timeToSaveId(start)), time_relevance);

        // increment start by the timeblock interval
        start.add(TIME_BLOCK_INTERVAL, TIME_BLOCK_INTERVAL_UNIT);
    }

}

function timeToSaveId(time){
    return time.format(PLANNER_SAVE_FORMAT);
}

function getEventText(saveId){
    if(!planner_data){
        // if planner data is not provided, load from local storage
        checkAndHandleConfig();
        planner_data = JSON.parse(window.localStorage.getItem(LS_PLANNER_DATA))
    }
    // current implementation just saves timestamps as a property in the planner_data
    return planner_data[saveId];

}

function saveEvent(saveId, text){
    checkAndHandleConfig();
    planner_data[saveId] = text;
    window.localStorage.setItem(LS_PLANNER_DATA, JSON.stringify(planner_data));
}


// function to append a timeblock row to the day planner
function addTimeblock(time, eventText, timeRelevance)
{
    /*
     * timeRelevance - expected input:
     * 0 - Past
     * 1 - Present
     * 2 - future
     */

    const divTimeblock = $("<div>");
    const elTime = $("<span>");
    const elEvent = $("<textArea>");
    const elSave = $("<button>");
    
    // add the text
    elTime.text(time.format(PLANNER_DISPLAY_FORMAT));
    elEvent.val(eventText);
    elSave.text('Save');
    elSave.data('saveid', timeToSaveId(time))

    //apply the appropriate classes
    divTimeblock.addClass("tb d-flex row border-0");
    elTime.addClass("tb-time py-2 col-1 text-right border border-left-0 border-dark");
    elEvent.addClass("tb-event py-2 col-9 border border-dark");
    elSave.addClass("tb-save col-1 text-center align-text-center border border-dark rounded-right");

    //color depends on if the item is in the past
    switch(timeRelevance){
        case TIME_PAST:
            elEvent.addClass(BG_CLASS_PAST);
            break;
        case TIME_PRESENT:
            elEvent.addClass(BG_CLASS_PRESENT);
            break;
        case TIME_FUTURE:
            elEvent.addClass(BG_CLASS_FUTURE);
            break;
    }
    
    //append elements to each other
    divTimeblock.append(elTime);
    divTimeblock.append(elEvent);
    divTimeblock.append(elSave);
    divTimeblocks.append(divTimeblock);
}

$(document).ready(function() {
    //init timeblocks
    generateTimeblocks(START_OF_DAY, END_OF_DAY, TIME_OF_DAY_FORMAT);

    //load today's date
    $('#currentDay').text(MOMENT_NOW.format('dddd, MMMM Do'))

    // add event handler to save if a button is clicked
    $(".tb-save").click( function(){
        saveEvent($(this).data('saveid'), $(this).prev('.tb-event').val())
        console.log('saveid:',$(this).data('saveid'), ' || text', $(this).prev('.tb-event').val())
    });
});