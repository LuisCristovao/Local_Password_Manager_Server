//---------------------------------------------------------------------------------------------
//-----------------------Search Part of the code-------------------------------------        
//--------------------------------------------------------------------------------------------- 
        var search;
        var filter=0.5;
        

        function supercompare(search_word, word){
            //first method
            var dif=Math.abs(search_word.length-word.length);
            var matches=0;
            var missMatches=0;
            var word_freq={};
            var search_freq={}
            var compare_lenght=Math.floor(word.length*0.5);
            //first method
            for(i=0;i<compare_lenght;i++){
                if(search_word[i]==word[i]){
                    matches++;
                }
            }

            var compare_index0=matches/(compare_lenght);


            //Second methods
            matches=0;
            missMatches=0;
            for(i=0;i<word.length;i++){
                //if not exists
                if(word_freq[word[i]]==null){
                    word_freq[word[i]]=1;
                }//already exists
                else{
                    var count=word_freq[word[i]];
                    count++;
                    word_freq[word[i]]=count;
                }
            }
            for(i=0;i<search_word.length;i++){
                //if not exists
                if(search_freq[search_word[i]]==null){
                    search_freq[search_word[i]]=1;
                }//already exists
                else{
                    var count=search_freq[search_word[i]];
                    count++;
                    search_freq[search_word[i]]=count;
                }
            }
            //
            matches=0;
            missMatches=0;
            for(var key in search_freq){
                //both have same letter
                if(search_freq[key]!=null && word_freq[key]!=null){


                    //
                    if(search_freq[key]==word_freq[key]){
                        matches+=search_freq[key];
                    }
                    else{
                        //give the lowest value of matches
                        matches+=(search_freq[key]<word_freq[key])? search_freq[key] : word_freq[key];
                        difference=Math.abs(search_freq[key]-word_freq[key]);
                        missMatches+=difference;
                    }

                }
                else{
                    missMatches++;
                }
            }
            //count missmatches if word bigger than search word
            for(var key in word_freq){
                if(search_freq[key]==null && word_freq[key]!=null){
                    missMatches++;
                }
            }
            var compare_index2=matches/(matches+missMatches);


            var compare_index=(compare_index2+compare_index0)/2;
            //
            return compare_index;

        }
        
        
        function liveSearch(){
            //$('#live_search').append('<p onmouseover="on(this,\'rgb(170,170,170)\')"  onmouseout="on(this,\'rgb(255,255,255)\')" onclick="put(this)">Bla1</p>');
            //$('#live_search').append('<p onmouseover="on(this,\'rgb(170,170,170)\')"  onmouseout="on(this,\'rgb(255,255,255)\')" onclick="put(this)">Bla333</p>');
            var max=0;
            var search_list={};
            var compare_list={};
            //order from best to worst
            var order_list=[];
            var i=0;
            var prev_filter=filter;

            search_text=search.value.toLowerCase();
          


                while(Object.keys(search_list).length<3 ){

                    for(key in research_words){
                        //Loading(Math.round((i/Object.keys(words).length)*100)+'%');
                        //i++;
                        compare_index=supercompare(search_text, key.toLowerCase())
                        //console.log("Compare index: "+compare_index);
                        if(compare_index>=filter){
                            //prev_words[key]=key;
                            if(search_list[key]==null){
                                //does not exist in search list
                                    search_list[key]=compare_index;


                            }
                        }
                    }
                    if(Object.keys(search_list).length<3){
                        filter-=0.1;
                    }
                    if(Object.keys(search_list).length>10){
                        filter+=0.1;
                    }
                    if(prev_filter==filter){
                        break;
                    }
                }

                //dictionary to array
                for(key in search_list){
                    order_list.push([key,search_list[key]]);
                }
                //order array with basic bubble sort
                var i=0;any_change=false;needs_change=true;
                while(needs_change && order_list.length>1){
                    var value=order_list[i][1];
                    j=i+1;
                    if(order_list[j][1]>value){
                        auxj=order_list[j];
                        auxi=order_list[i];
                        order_list[i]=auxj;
                        order_list[j]=auxi;
                        any_change=true;
                    }
                    i++;
                    if(i==order_list.length-1){
                        i=0;
                        //There was no change so it's ordered
                        if(!any_change){
                            needs_change=false;
                        }
                        else{
                            any_change=false;
                        }
                    }
                }
                $('#myDropdown').html('');
                for(i=0;i<order_list.length && order_list.length>0;i++){
                        $('#myDropdown').append('<div id="'+order_list[i][0]+'"><p  onclick="Select(this.innerHTML,this.parentNode)">'+order_list[i][0]+'</p></div>');
                }
            
        }
        
        
 
        
//Begining of file start

function Init(){
    search=document.getElementById('search');
    if(search==null){
        setTimeout(Init,100);
    }
    else{
        search.addEventListener("input",function(){liveSearch();});
    }
}
Init();

        
        
        
