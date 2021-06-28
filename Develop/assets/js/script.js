const TIME_PAST = 0;
const TIME_PRESENT = 1;
const TIME_FUTURE = 2;

const BG_CLASS_PAST = 'bg-danger';
const BG_CLASS_PRESENT = 'bg-info';
const BG_CLASS_FUTURE = 'bg-success';

const divTimeblocks = $("#timeblocks");


// function to append a timeblock row to the day planner
function addTimeblock(timeText, eventText, timeRelevance)
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
    elTime.text(timeText);
    elEvent.text(eventText);
    elSave.text('Save');

    //apply the appropriate classes
    divTimeblock.addClass("tb d-flex row border-0");
    elTime.addClass("tb-time py-2 col-1 text-right border border-left-0 border-dark");
    elEvent.addClass("tb-event py-2 col-9 border border-dark");
    elSave.addClass("tb-time col-1 text-center align-text-center border border-dark rounded-right");

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