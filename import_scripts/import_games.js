const neatCsv = require('neat-csv');
const fs = require('fs');
const path = require('path');

const csvNames = [
    'steam',
    'steamspy_tag_data',
    'steam_support_info',
    'steam_requirements_data',
    'steam_media_data',
    'steam_description_data'
];

async function parse() {
    let gamesObject = {};
    
    for await (let csvName of csvNames) {
        const csvPath = path.resolve('csv/' + csvName + '.csv');
        const parserInfo = require('./' + csvName + '.js');
        
        const rawCsv = fs.readFileSync(csvPath, { encoding: 'utf8'});
        const csvData = await neatCsv(rawCsv);
        
        for await (let data of csvData) {
            const parsedInfo = parserInfo.objectImport(data);
            const mergingObject = {};
            mergingObject[parsedInfo.id] = Object.assign({}, gamesObject[parsedInfo.id], parsedInfo);
            gamesObject = Object.assign(gamesObject, mergingObject);
        }
    }
    return Object.values(gamesObject);
}

const dbIndexScheme = {
    index: 'project_s6_games',
    body: {
        settings: {
            index: {
                max_result_window: 30000
            },
            analysis: {
                normalizer: {
                    my_normalizer: {
                        type: "custom",
                        char_filter: [],
                        filter: "lowercase"
                    }
                }
            }
        },
        mappings: {
            properties: {
                id: { type: 'integer' },
                name: { type: 'keyword', normalizer: "my_normalizer" },
                release_date: { type: 'date' },
                english: { type: 'boolean' },
                developer: { type: 'keyword'},
                publisher: { type: 'keyword' },
                platforms: { type: 'keyword' },
                required_age: { type: 'keyword' },
                categories: { type: 'keyword' },
                genres: { type: 'keyword' },
                steamspy_tags: { type: 'keyword' },
                achievements: { type: 'short' },
                positive_ratings: { type: 'integer' },
                negative_ratings: { type: 'integer' },
                average_playtime: { type: 'integer' },
                median_playtime: { type: 'integer' },
                owners: { type: 'text' },
                price: { type: 'float' },
                tag_1980s: { type: 'integer' },
                tag_1990s:  { type: 'integer' },
                tag_2$5d:  { type: 'integer' },
                tag_2d:  { type: 'integer' },
                tag_2d_fighter:  { type: 'integer' },
                tag_360_video:  { type: 'integer' },
                tag_3d:  { type: 'integer' },
                tag_3d_platformer:  { type: 'integer' },
                tag_3d_vision:  { type: 'integer' },
                tag_4_player_local:  { type: 'integer' },
                tag_4x:  { type: 'integer' },
                tag_6dof:  { type: 'integer' },
                tag_atv:  { type: 'integer' },
                tag_abstract:  { type: 'integer' },
                tag_action:  { type: 'integer' },
                tag_action_rpg:  { type: 'integer' },
                tag_action_adventure:  { type: 'integer' },
                tag_addictive:  { type: 'integer' },
                tag_adventure:  { type: 'integer' },
                tag_agriculture:  { type: 'integer' },
                tag_aliens:  { type: 'integer' },
                tag_alternate_history:  { type: 'integer' },
                tag_america:  { type: 'integer' },
                tag_animation_and_modeling:  { type: 'integer' },
                tag_anime:  { type: 'integer' },
                tag_arcade:  { type: 'integer' },
                tag_arena_shooter:  { type: 'integer' },
                tag_artificial_intelligence:  { type: 'integer' },
                tag_assassin:  { type: 'integer' },
                tag_asynchronous_multiplayer:  { type: 'integer' },
                tag_atmospheric:  { type: 'integer' },
                tag_audio_production:  { type: 'integer' },
                tag_bmx:  { type: 'integer' },
                tag_base_building:  { type: 'integer' },
                tag_baseball:  { type: 'integer' },
                tag_based_on_a_novel:  { type: 'integer' },
                tag_basketball:  { type: 'integer' },
                tag_batman:  { type: 'integer' },
                tag_battle_royale:  { type: 'integer' },
                tag_beat_em_up:  { type: 'integer' },
                tag_beautiful:  { type: 'integer' },
                tag_benchmark:  { type: 'integer' },
                tag_bikes:  { type: 'integer' },
                tag_blood:  { type: 'integer' },
                tag_board_game:  { type: 'integer' },
                tag_bowling:  { type: 'integer' },
                tag_building:  { type: 'integer' },
                tag_bullet_hell:  { type: 'integer' },
                tag_bullet_time:  { type: 'integer' },
                tag_crpg:  { type: 'integer' },
                tag_capitalism:  { type: 'integer' },
                tag_card_game:  { type: 'integer' },
                tag_cartoon:  { type: 'integer' },
                tag_cartoony:  { type: 'integer' },
                tag_casual:  { type: 'integer' },
                tag_cats:  { type: 'integer' },
                tag_character_action_game:  { type: 'integer' },
                tag_character_customization:  { type: 'integer' },
                tag_chess:  { type: 'integer' },
                tag_choices_matter:  { type: 'integer' },
                tag_choose_your_own_adventure:  { type: 'integer' },
                tag_cinematic:  { type: 'integer' },
                tag_city_builder:  { type: 'integer' },
                tag_class_based:  { type: 'integer' },
                tag_classic:  { type: 'integer' },
                tag_clicker:  { type: 'integer' },
                tag_co_op:  { type: 'integer' },
                tag_co_op_campaign:  { type: 'integer' },
                tag_cold_war:  { type: 'integer' },
                tag_colorful:  { type: 'integer' },
                tag_comedy:  { type: 'integer' },
                tag_comic_book:  { type: 'integer' },
                tag_competitive:  { type: 'integer' },
                tag_conspiracy:  { type: 'integer' },
                tag_controller:  { type: 'integer' },
                tag_conversation:  { type: 'integer' },
                tag_crafting:  { type: 'integer' },
                tag_crime:  { type: 'integer' },
                tag_crowdfunded:  { type: 'integer' },
                tag_cult_classic:  { type: 'integer' },
                tag_cute:  { type: 'integer' },
                tag_cyberpunk:  { type: 'integer' },
                tag_cycling:  { type: 'integer' },
                tag_dark:  { type: 'integer' },
                tag_dark_comedy:  { type: 'integer' },
                tag_dark_fantasy:  { type: 'integer' },
                tag_dark_humor:  { type: 'integer' },
                tag_dating_sim:  { type: 'integer' },
                tag_demons:  { type: 'integer' },
                tag_design_and_illustration:  { type: 'integer' },
                tag_destruction:  { type: 'integer' },
                tag_detective:  { type: 'integer' },
                tag_difficult:  { type: 'integer' },
                tag_dinosaurs:  { type: 'integer' },
                tag_diplomacy:  { type: 'integer' },
                tag_documentary:  { type: 'integer' },
                tag_dog:  { type: 'integer' },
                tag_dragons:  { type: 'integer' },
                tag_drama:  { type: 'integer' },
                tag_driving:  { type: 'integer' },
                tag_dungeon_crawler:  { type: 'integer' },
                tag_dungeons_and_dragons:  { type: 'integer' },
                tag_dynamic_narration:  { type: 'integer' },
                tag_dystopian:  { type: 'integer' },
                tag_early_access:  { type: 'integer' },
                tag_economy:  { type: 'integer' },
                tag_education:  { type: 'integer' },
                tag_emotional:  { type: 'integer' },
                tag_epic:  { type: 'integer' },
                tag_episodic:  { type: 'integer' },
                tag_experience:  { type: 'integer' },
                tag_experimental:  { type: 'integer' },
                tag_exploration:  { type: 'integer' },
                tag_fmv:  { type: 'integer' },
                tag_fps:  { type: 'integer' },
                tag_faith:  { type: 'integer' },
                tag_family_friendly:  { type: 'integer' },
                tag_fantasy:  { type: 'integer' },
                tag_fast_paced:  { type: 'integer' },
                tag_feature_film:  { type: 'integer' },
                tag_female_protagonist:  { type: 'integer' },
                tag_fighting:  { type: 'integer' },
                tag_first_person:  { type: 'integer' },
                tag_fishing:  { type: 'integer' },
                tag_flight:  { type: 'integer' },
                tag_football:  { type: 'integer' },
                tag_foreign:  { type: 'integer' },
                tag_free_to_play:  { type: 'integer' },
                tag_funny:  { type: 'integer' },
                tag_futuristic:  { type: 'integer' },
                tag_gambling:  { type: 'integer' },
                tag_game_development:  { type: 'integer' },
                tag_gamemaker:  { type: 'integer' },
                tag_games_workshop:  { type: 'integer' },
                tag_gaming:  { type: 'integer' },
                tag_god_game:  { type: 'integer' },
                tag_golf:  { type: 'integer' },
                tag_gore:  { type: 'integer' },
                tag_gothic:  { type: 'integer' },
                tag_grand_strategy:  { type: 'integer' },
                tag_great_soundtrack:  { type: 'integer' },
                tag_grid_based_movement:  { type: 'integer' },
                tag_gun_customization:  { type: 'integer' },
                tag_hack_and_slash:  { type: 'integer' },
                tag_hacking:  { type: 'integer' },
                tag_hand_drawn:  { type: 'integer' },
                tag_hardware:  { type: 'integer' },
                tag_heist:  { type: 'integer' },
                tag_hex_grid:  { type: 'integer' },
                tag_hidden_object:  { type: 'integer' },
                tag_historical:  { type: 'integer' },
                tag_hockey:  { type: 'integer' },
                tag_horror:  { type: 'integer' },
                tag_horses:  { type: 'integer' },
                tag_hunting:  { type: 'integer' },
                tag_illuminati:  { type: 'integer' },
                tag_indie:  { type: 'integer' },
                tag_intentionally_awkward_controls:  { type: 'integer' },
                tag_interactive_fiction:  { type: 'integer' },
                tag_inventory_management:  { type: 'integer' },
                tag_investigation:  { type: 'integer' },
                tag_isometric:  { type: 'integer' },
                tag_jrpg:  { type: 'integer' },
                tag_jet:  { type: 'integer' },
                tag_kickstarter:  { type: 'integer' },
                tag_lego:  { type: 'integer' },
                tag_lara_croft:  { type: 'integer' },
                tag_lemmings:  { type: 'integer' },
                tag_level_editor:  { type: 'integer' },
                tag_linear:  { type: 'integer' },
                tag_local_co_op:  { type: 'integer' },
                tag_local_multiplayer:  { type: 'integer' },
                tag_logic:  { type: 'integer' },
                tag_loot:  { type: 'integer' },
                tag_lore_rich:  { type: 'integer' },
                tag_lovecraftian:  { type: 'integer' },
                tag_mmorpg:  { type: 'integer' },
                tag_moba:  { type: 'integer' },
                tag_magic:  { type: 'integer' },
                tag_management:  { type: 'integer' },
                tag_mars:  { type: 'integer' },
                tag_martial_arts:  { type: 'integer' },
                tag_massively_multiplayer:  { type: 'integer' },
                tag_masterpiece:  { type: 'integer' },
                tag_match_3:  { type: 'integer' },
                tag_mature:  { type: 'integer' },
                tag_mechs:  { type: 'integer' },
                tag_medieval:  { type: 'integer' },
                tag_memes:  { type: 'integer' },
                tag_metroidvania:  { type: 'integer' },
                tag_military:  { type: 'integer' },
                tag_mini_golf:  { type: 'integer' },
                tag_minigames:  { type: 'integer' },
                tag_minimalist:  { type: 'integer' },
                tag_mining:  { type: 'integer' },
                tag_mod:  { type: 'integer' },
                tag_moddable:  { type: 'integer' },
                tag_modern:  { type: 'integer' },
                tag_motocross:  { type: 'integer' },
                tag_motorbike:  { type: 'integer' },
                tag_mouse_only:  { type: 'integer' },
                tag_movie:  { type: 'integer' },
                tag_multiplayer:  { type: 'integer' },
                tag_multiple_endings:  { type: 'integer' },
                tag_music:  { type: 'integer' },
                tag_music_based_procedural_generation:  { type: 'integer' },
                tag_mystery:  { type: 'integer' },
                tag_mystery_dungeon:  { type: 'integer' },
                tag_mythology:  { type: 'integer' },
                tag_nsfw:  { type: 'integer' },
                tag_narration:  { type: 'integer' },
                tag_naval:  { type: 'integer' },
                tag_ninja:  { type: 'integer' },
                tag_noir:  { type: 'integer' },
                tag_nonlinear:  { type: 'integer' },
                tag_nudity:  { type: 'integer' },
                tag_offroad:  { type: 'integer' },
                tag_old_school:  { type: 'integer' },
                tag_on_rails_shooter:  { type: 'integer' },
                tag_online_co_op:  { type: 'integer' },
                tag_open_world:  { type: 'integer' },
                tag_otome:  { type: 'integer' },
                tag_parkour:  { type: 'integer' },
                tag_parody:  { type: 'integer' },
                tag_party_based_rpg:  { type: 'integer' },
                tag_perma_death:  { type: 'integer' },
                tag_philisophical:  { type: 'integer' },
                tag_photo_editing:  { type: 'integer' },
                tag_physics:  { type: 'integer' },
                tag_pinball:  { type: 'integer' },
                tag_pirates:  { type: 'integer' },
                tag_pixel_graphics:  { type: 'integer' },
                tag_platformer:  { type: 'integer' },
                tag_point_and_click:  { type: 'integer' },
                tag_political:  { type: 'integer' },
                tag_politics:  { type: 'integer' },
                tag_pool:  { type: 'integer' },
                tag_post_apocalyptic:  { type: 'integer' },
                tag_procedural_generation:  { type: 'integer' },
                tag_programming:  { type: 'integer' },
                tag_psychedelic:  { type: 'integer' },
                tag_psychological:  { type: 'integer' },
                tag_psychological_horror:  { type: 'integer' },
                tag_puzzle:  { type: 'integer' },
                tag_puzzle_platformer:  { type: 'integer' },
                tag_pve:  { type: 'integer' },
                tag_pvp:  { type: 'integer' },
                tag_quick_time_events:  { type: 'integer' },
                tag_rpg:  { type: 'integer' },
                tag_rpgmaker:  { type: 'integer' },
                tag_rts:  { type: 'integer' },
                tag_racing:  { type: 'integer' },
                tag_real_time_tactics:  { type: 'integer' },
                tag_real_time:  { type: 'integer' },
                tag_real_time_with_pause:  { type: 'integer' },
                tag_realistic:  { type: 'integer' },
                tag_relaxing:  { type: 'integer' },
                tag_remake:  { type: 'integer' },
                tag_replay_value:  { type: 'integer' },
                tag_resource_management:  { type: 'integer' },
                tag_retro:  { type: 'integer' },
                tag_rhythm:  { type: 'integer' },
                tag_robots:  { type: 'integer' },
                tag_rogue_like:  { type: 'integer' },
                tag_rogue_lite:  { type: 'integer' },
                tag_romance:  { type: 'integer' },
                tag_rome:  { type: 'integer' },
                tag_runner:  { type: 'integer' },
                tag_sailing:  { type: 'integer' },
                tag_sandbox:  { type: 'integer' },
                tag_satire:  { type: 'integer' },
                tag_sci_fi:  { type: 'integer' },
                tag_science:  { type: 'integer' },
                tag_score_attack:  { type: 'integer' },
                tag_sequel:  { type: 'integer' },
                tag_sexual_content:  { type: 'integer' },
                tag_shoot_em_up:  { type: 'integer' },
                tag_shooter:  { type: 'integer' },
                tag_short:  { type: 'integer' },
                tag_side_scroller:  { type: 'integer' },
                tag_silent_protagonist:  { type: 'integer' },
                tag_simulation:  { type: 'integer' },
                tag_singleplayer:  { type: 'integer' },
                tag_skateboarding:  { type: 'integer' },
                tag_skating:  { type: 'integer' },
                tag_skiing:  { type: 'integer' },
                tag_sniper:  { type: 'integer' },
                tag_snow:  { type: 'integer' },
                tag_snowboarding:  { type: 'integer' },
                tag_soccer:  { type: 'integer' },
                tag_software:  { type: 'integer' },
                tag_software_training:  { type: 'integer' },
                tag_sokoban:  { type: 'integer' },
                tag_souls_like:  { type: 'integer' },
                tag_soundtrack:  { type: 'integer' },
                tag_space:  { type: 'integer' },
                tag_space_sim:  { type: 'integer' },
                tag_spectacle_fighter:  { type: 'integer' },
                tag_spelling:  { type: 'integer' },
                tag_split_screen:  { type: 'integer' },
                tag_sports:  { type: 'integer' },
                tag_star_wars:  { type: 'integer' },
                tag_stealth:  { type: 'integer' },
                tag_steam_machine:  { type: 'integer' },
                tag_steampunk:  { type: 'integer' },
                tag_story_rich:  { type: 'integer' },
                tag_strategy:  { type: 'integer' },
                tag_strategy_rpg:  { type: 'integer' },
                tag_stylized:  { type: 'integer' },
                tag_submarine:  { type: 'integer' },
                tag_superhero:  { type: 'integer' },
                tag_supernatural:  { type: 'integer' },
                tag_surreal:  { type: 'integer' },
                tag_survival:  { type: 'integer' },
                tag_survival_horror:  { type: 'integer' },
                tag_swordplay:  { type: 'integer' },
                tag_tactical:  { type: 'integer' },
                tag_tactical_rpg:  { type: 'integer' },
                tag_tanks:  { type: 'integer' },
                tag_team_based:  { type: 'integer' },
                tag_tennis:  { type: 'integer' },
                tag_text_based:  { type: 'integer' },
                tag_third_person:  { type: 'integer' },
                tag_third_person_shooter:  { type: 'integer' },
                tag_thriller:  { type: 'integer' },
                tag_time_attack:  { type: 'integer' },
                tag_time_management:  { type: 'integer' },
                tag_time_manipulation:  { type: 'integer' },
                tag_time_travel:  { type: 'integer' },
                tag_top_down:  { type: 'integer' },
                tag_top_down_shooter:  { type: 'integer' },
                tag_touch_friendly:  { type: 'integer' },
                tag_tower_defense:  { type: 'integer' },
                tag_trackir:  { type: 'integer' },
                tag_trading:  { type: 'integer' },
                tag_trading_card_game:  { type: 'integer' },
                tag_trains:  { type: 'integer' },
                tag_transhumanism:  { type: 'integer' },
                tag_turn_based:  { type: 'integer' },
                tag_turn_based_combat:  { type: 'integer' },
                tag_turn_based_strategy:  { type: 'integer' },
                tag_turn_based_tactics:  { type: 'integer' },
                tag_tutorial:  { type: 'integer' },
                tag_twin_stick_shooter:  { type: 'integer' },
                tag_typing:  { type: 'integer' },
                tag_underground:  { type: 'integer' },
                tag_underwater:  { type: 'integer' },
                tag_unforgiving:  { type: 'integer' },
                tag_utilities:  { type: 'integer' },
                tag_vr:  { type: 'integer' },
                tag_vr_only:  { type: 'integer' },
                tag_vampire:  { type: 'integer' },
                tag_video_production:  { type: 'integer' },
                tag_villain_protagonist:  { type: 'integer' },
                tag_violent:  { type: 'integer' },
                tag_visual_novel:  { type: 'integer' },
                tag_voice_control:  { type: 'integer' },
                tag_voxel:  { type: 'integer' },
                tag_walking_simulator:  { type: 'integer' },
                tag_war:  { type: 'integer' },
                tag_wargame:  { type: 'integer' },
                tag_warhammer_40k:  { type: 'integer' },
                tag_web_publishing:  { type: 'integer' },
                tag_werewolves:  { type: 'integer' },
                tag_western:  { type: 'integer' },
                tag_word_game:  { type: 'integer' },
                tag_world_war_i:  { type: 'integer' },
                tag_world_war_ii:  { type: 'integer' },
                tag_wrestling:  { type: 'integer' },
                tag_zombies:  { type: 'integer' },
                tag_e_sports:  { type: 'integer' },
                website: { type: 'text' },
                support_url: { type: 'text' },
                support_email: { type: 'text' },
                detailed_description: { type: 'text' },
                about_the_game: { type: 'text' },
                short_description: { type: 'text' },
                header_image: { type: 'text' },
                screenshots: { type: 'object' },
                background: { type: 'text' },
                movies: { type: 'object' },
                pc_requirements: { type: 'object' },
                mac_requirements: { type: 'object' },
                linux_requirements: { type: 'object' },
                minimum: { type: 'text' },
                recommended: { type: 'text' }
            }
        }
    }
};

module.exports = { parse, dbIndexScheme };