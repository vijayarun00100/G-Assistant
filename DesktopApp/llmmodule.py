from transformers import pipeline, AutoModelForCausalLM, AutoTokenizer
from langchain_community.llms import HuggingFacePipeline
from langchain_experimental.llms import JsonFormer
from dotenv import load_dotenv, dotenv_values
import json
import os
import openRoutersLLM

config = dict(dotenv_values())

workMode = config["WORK_MODE"]

if workMode == "LOCAL_LLM":
    summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
    hf_model = pipeline("text-generation", model="microsoft/phi-1_5", max_new_tokens = 70)
    hfpipeline = HuggingFacePipeline(pipeline=hf_model)


# Lines below are probably outdated now
# model = AutoModelForCausalLM.from_pretrained("CobraMamba/mamba-gpt-3b-v4")
# tokenizer = AutoTokenizer.from_pretrained("CobraMamba/mamba-gpt-3b-v4")

def summarizeThis(text):
    if workMode == "DEBUGGING":
        return "The tower is 324 metres (1,063 ft) tall, about the same height as an 81-storey building. Its base is square, measuring 125 metres (410 ft) on each side. During its construction, the Eiffel Tower surpassed the Washington Monument to become the tallest man-made structure in the world."
    elif workMode == "LOCAL_LLM":
        return (summarizer(text, max_length=100))[0]['summary_text']
    
    elif workMode == "OPENROUTERS":
        return openRoutersLLM.getPromptResponse(f"Tell me what this email sent to me is about in less than 100 words: {text}")['choices'][0]['message']['content']

def generateResponse(mailContent):
    print(workMode)
    if workMode == "DEBUGGING":
        return "Example response to an email"
    elif workMode == "OPENROUTERS":
        return openRoutersLLM.getPromptResponse(f"I received the following mail. Generate response to the mail:\n {mailContent}")['choices'][0]['message']['content']

def jsonExtractor(emailText):
    if workMode == "DEBUGGING":
        return {"eventname": "GenAIHackathon", "date": "19-04-2024", "location": "MG Auditorium"}

    elif workMode == "LOCAL_LLM":
        PROMPT=f"""You must respond using JSON format.
Extract details of an event from given body of text

{JSON_SCHEMA}

EXAMPLES
--------
{TRAINING_EXAMPLE}

BEGIN! Extract event data
--------
Mail: {emailText}
Data:"""
        text = hfpipeline.invoke(PROMPT, stop=["Mail:","Data:", "Email:", "--------", "}"])
        text = str(text)
    
        # MODEL SPECIFIC TEXT PROCESSING
        text = text[:text.find('Email:')]
        
        # TEXT PROCESSING
        text = (text[text.rfind('{'): text.rfind('}') + 1])
        text = text.replace("\n","").replace("\r\n","")
        return (json.loads(text))
    
    elif workMode == "OPENROUTERS":
        PROMPT=f"""You must respond using JSON format.
Extract details of an event from given body of text
EXAMPLES
--------
{TRAINING_EXAMPLE}

BEGIN! Extract event data
--------
Mail: {emailText}
Data:"""
        responseJson = openRoutersLLM.getPromptResponse(PROMPT)
        print(responseJson['choices'][0]['message']['content'])
        possibleJsonData = responseJson['choices'][0]['message']['content'].strip().replace('\n','').replace('\\','')
        possibleJsonData = (possibleJsonData[possibleJsonData.find('{'): possibleJsonData.rfind('}') + 1])
        print("POSSIBLE JSON DATA\n\n", json.loads(possibleJsonData))
        return json.loads(possibleJsonData)

def createActionExtractionPrompt(mailText):
    return """Extract action items from the following Mail Conversation
Respond only in valid JSON strictly using following JSON_schema:
{"items": [{"name": "task1", "date":"dd-mm-yy","time":"HH:MM:SS"}]
always generate the output in the json schema
Current Date: 16-04-24
Add deadline time only if possible but deadline date is necessary if possible
deadline date format: dd-mm-yy
deadline time format: HH:MM:SS
Don't extract items if they have already been completed

EXAMPLES:

Mail: Please complete report by April 16
JSON: {"items": [{"name": "Complete Report", "date":"16-04-24","time":""}]}
Mail: Please create a meet at 2:00 PM on 17th of April
JSON: {"items": [{"name": "Create Meet", "date":"17-04-24","time":"14:00:00"}]}
Mail: goto VIT Chennai at 15 April to collect ID and schedule online meet tomorrow at 8:00PM
JSON: {"items": [{"name":"Collect ID at VIT Chennai","date":"15-04-24","time":""}, {"name":"Schedule Meet","date":"17-04-24","time":"20:00:00"}]}
Mail: Hi bro how are you ?
JSON: {"items": []}

Now complete:
Mail:
%s
JSON:
""" % mailText

def generateActionItems(emailText):
    prompt = createActionExtractionPrompt(emailText)
    if workMode == "DEBUGGING":
        return {"items": [{"name":"Collect ID at VIT Chennai","date":"15-04-2024","time":""}, {"name":"Schedule Meet","date":"17-04-2024","time":"20:00:00"}]}
    elif workMode == "OPENROUTERS":
        responseJson = openRoutersLLM.getPromptResponse(prompt)
        possibleJsonData = responseJson['choices'][0]['message']['content'].strip().replace('\n','')
        possibleJsonData = (possibleJsonData[possibleJsonData.find('{'): possibleJsonData.rfind('}') + 1])
        return json.loads(possibleJsonData)


"""
========================================
                   TESTING
========================================
"""

ARTICLE = """ New York (CNN)When Liana Barrientos was 23 years old, she got married in Westchester County, New York.
A year later, she got married again in Westchester County, but to a different man and without divorcing her first husband.
Only 18 days after that marriage, she got hitched yet again. Then, Barrientos declared "I do" five more times, sometimes only within two weeks of each other.
In 2010, she married once more, this time in the Bronx. In an application for a marriage license, she stated it was her "first and only" marriage.
Barrientos, now 39, is facing two criminal counts of "offering a false instrument for filing in the first degree," referring to her false statements on the
2010 marriage license application, according to court documents.
Prosecutors said the marriages were part of an immigration scam.
On Friday, she pleaded not guilty at State Supreme Court in the Bronx, according to her attorney, Christopher Wright, who declined to comment further.
After leaving court, Barrientos was arrested and charged with theft of service and criminal trespass for allegedly sneaking into the New York subway through an emergency exit, said Detective
Annette Markowski, a police spokeswoman. In total, Barrientos has been married 10 times, with nine of her marriages occurring between 1999 and 2002.
All occurred either in Westchester County, Long Island, New Jersey or the Bronx. She is believed to still be married to four men, and at one time, she was married to eight men at once, prosecutors say.
Prosecutors said the immigration scam involved some of her husbands, who filed for permanent residence status shortly after the marriages.
Any divorces happened only after such filings were approved. It was unclear whether any of the men will be prosecuted.
The case was referred to the Bronx District Attorney\'s Office by Immigration and Customs Enforcement and the Department of Homeland Security\'s
Investigation Division. Seven of the men are from so-called "red-flagged" countries, including Egypt, Turkey, Georgia, Pakistan and Mali.
Her eighth husband, Rashid Rajput, was deported in 2006 to his native Pakistan after an investigation by the Joint Terrorism Task Force.
If convicted, Barrientos faces up to four years in prison.  Her next court appearance is scheduled for May 18.
"""

JSON_SCHEMA = {
    "type": "object",
    "properties": {
        "eventname": {"type": "string"},
        "location": {"type": "string"},
        "date": {"type": "string"},
    }
}

TRAINING_EXAMPLE = """
Text: I would like to invite you to Workshop on iOS Development at MG Auditorium on 21st May 2024
JSON: {"eventname":"Workshop on iOS Development","date":"21-05-2024","location":"MG Auditorium"}
Text: Students please attend SAP Hackathon on 22nd MAY 2025 at Kasturba Gandhi auditorium
JSON: {"eventname":"SAP Hackathon","date":"22-05-2024","location":"Kasturba Gandhi auditorium"}
"""

EMAIL_EXAMPLE = """
event name: GenAIHackathon at MG Auditorium on 19th April 2024
"""

EXAMPLE_PROMPT = f"""You must respond using JSON format.
Extract details of an event from given body of text

{JSON_SCHEMA}

EXAMPLES
--------
{TRAINING_EXAMPLE}

Now Extract event data as JSON for the following email:
--------
Mail: {EMAIL_EXAMPLE}
JSON:"""

RESPONSE_MAIL_EXAMPLE = """
How are you bro ?
"""

EXAMPLE_TASK_MAIL = """
Hey prem,

By tomorrow complete the project report, create a presentation, pick up order from VIT Chennai and notify me tomorrow at 3:00 PM via Meet.

"""

if __name__ == "__main__":
    print("Work Mode: ", workMode)
    if input("run json extractor ? ") == 'y': print(jsonExtractor(EMAIL_EXAMPLE))
    if input("run summarizer ? ") == 'y': print(summarizeThis(ARTICLE))
    if input("run generate response ? ") == 'y': print(generateResponse(RESPONSE_MAIL_EXAMPLE))
    if input("run action extraction ? ") == 'y': print(generateActionItems(EXAMPLE_TASK_MAIL))