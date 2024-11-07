import pandas as pd
import json

class Campaign:
    def __init__(self, input_file, output_file, rid):
        self.input_file = input_file
        self.output_file = output_file
        self.rid = rid
        self.loaded_file = None

        self.workbook = None
        self.overall_statistics_df = None
        self.unique_statistics_df = None
        self.detailed_results_df = None
        self.provided_data_df = None
        self.raw_events_df = None

    def load_csv(self):
        self.loaded_file = pd.read_csv(self.input_file)

    def read_statistics(self):
        actions = ["Email Sent", "Clicked Link", "Activity Detected", "Submitted Data"]

        # Overall statistics
        overall_stats = {action: self.loaded_file[self.loaded_file['message'] == action].shape[0] for action in actions}
        self.overall_statistics_df = pd.DataFrame({
            'Action': list(overall_stats.keys()),
            'Count': list(overall_stats.values()),
        })

        # Unique statistics
        unique_stats = {action: self.loaded_file[self.loaded_file['message'] == action]['email'].nunique() for action in actions}
        self.unique_statistics_df = pd.DataFrame({
            'Action': list(unique_stats.keys()),
            'Unique Count': list(unique_stats.values())
        })

    def read_campaign_results(self):
        # Filter out rows with message "Campaign Started"
        filtered_file = self.loaded_file[self.loaded_file['message'] != "Campaign Created"]

        # Create detailed results DataFrame directly from the filtered data
        self.detailed_results_df = filtered_file[['first_name', 'last_name', 'email']].drop_duplicates().reset_index(
            drop=True)

        # Apply transformations to check for each specific message type
        self.detailed_results_df['Clicked Link'] = self.detailed_results_df['email'].apply(
            lambda x: 'Yes' if 'Clicked Link' in filtered_file[filtered_file['email'] == x]['message'].values else 'No'
        )

        self.detailed_results_df['Activity Detected'] = self.detailed_results_df['email'].apply(
            lambda x: 'Yes' if 'Activity Detected' in filtered_file[filtered_file['email'] == x][
                'message'].values else 'No'
        )

        self.detailed_results_df['Submitted Data'] = self.detailed_results_df['email'].apply(
            lambda x: 'Yes' if 'Submitted Data' in filtered_file[filtered_file['email'] == x][
                'message'].values else 'No'
        )

        # Process and aggregate rid data while filtering out "Campaign Started" messages
        self.detailed_results_df[self.rid] = self.detailed_results_df['email'].apply(
            lambda x: ', '.join(set(
                [item for sublist in filtered_file[filtered_file['email'] == x]['details'].apply(
                    lambda d: json.loads(d).get('payload', {}).get(self.rid, []) if isinstance(d, str) else []
                ).values for item in sublist]
            ))
        )

    def read_provided_data(self):
        submitted_data_df = self.loaded_file[self.loaded_file['message'] == 'Submitted Data']
        provided_data_list = []

        for _, row in submitted_data_df.iterrows():
            # Initialize provided_data as a blank dictionary
            provided_data = {}

            # Dynamically add all fields from the main row
            for col, value in row.items():
                if pd.notnull(value):  # Check to ignore NaN values
                    provided_data[col] = value

            # Parse the JSON details and dynamically add fields
            details = json.loads(row['details']) if isinstance(row['details'], str) else {}

            # Add fields from payload and browser, and any nested dictionaries
            for key, sub_dict in details.items():
                if isinstance(sub_dict, dict):
                    for sub_key, sub_value in sub_dict.items():
                        # If the value is a list, join it; otherwise, add it directly
                        provided_data[sub_key] = ', '.join(sub_value) if isinstance(sub_value, list) else sub_value
                else:
                    provided_data[key] = sub_dict  # Directly add non-dict items

            provided_data_list.append(provided_data)

        # Convert to DataFrame
        self.provided_data_df = pd.DataFrame(provided_data_list)

    def read_raw_events(self):
        raw_events_list = []

        for _, row in self.loaded_file.iterrows():
            details = json.loads(row['details']) if isinstance(row['details'], str) else {}
            payload = details.get('payload', {})
            browser = details.get('browser', {})

            raw_event = {
                'first_name': row['first_name'],
                'last_name': row['last_name'],
                'email': row['email'],
                'Timestamp': row['time'],
                'action': row['message'],
                'address': browser.get('address', ''),
                'user-agent': browser.get('user-agent', ''),
                self.rid: ', '.join(payload.get(self.rid, []))
            }
            raw_events_list.append(raw_event)

        self.raw_events_df = pd.DataFrame(raw_events_list)



