import pickle
import pandas as pd
from flask import Flask, request, jsonify
from sklearn.preprocessing import LabelEncoder

label = LabelEncoder()

# Load the model from the file
with open('xgb_model.pkl', 'rb') as file:
    loaded_model = pickle.load(file)

labels = ['step', 'type', 'amount', 'nameOrig', 'oldbalanceOrg', 'newbalanceOrig', 'nameDest', 'oldbalanceDest', 'newbalanceDest', 'isFlaggedFraud']
app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
  # Get data from the request
  data = request.get_json()
  # Check if data is present
  if not data:
    return jsonify({'error': 'No data provided'}), 400
  if not isinstance(data, list):
    return jsonify({'error': 'Input data should be a list of dictionaries'}), 400
  if not all(isinstance(item, dict) for item in data):
    return jsonify({'error': 'All elements of the list should be dictionaries'}), 400
  try:
    df = pd.DataFrame(data)
    id_s = df['id']
    processed_df = df.drop(columns=['id'])
    processed_df = processed_df.reindex(columns=labels)
    processed_df['nameOrig'] = label.fit_transform(df['nameOrig'])
    processed_df['nameDest'] = label.fit_transform(df['nameDest'])
    processed_df['type'] = label.fit_transform(df['type'])
    probs = loaded_model.predict_proba(processed_df)
    prob = [p[0] for p in probs]
    response_df = pd.DataFrame.from_dict({'id': id_s})
    response_df['probability'] = prob
    response =  response_df.to_dict(orient='records')

    return jsonify(response), 200
  except Exception as e:
    return jsonify({'error': str(e)}), 500
        
app.run(debug=True)
