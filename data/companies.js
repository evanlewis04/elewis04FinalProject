// Five-layer cake of the AI supply chain.
// Each layer holds the most relevant publicly traded companies, their ticker
// symbol (used to query Finnhub) and a short description of the role they play.

const layers = {
    energy: {
        key: "energy",
        name: "Energy",
        order: 1,
        color: "#f59e0b",
        description:
            "Power generation, grid operators and nuclear providers that supply the enormous electricity demand of AI data centers.",
        companies: [
            {
                ticker: "NEE",
                name: "NextEra Energy",
                role: "Largest U.S. renewable energy producer; supplies wind, solar and storage power to hyperscale data centers.",
            },
            {
                ticker: "CEG",
                name: "Constellation Energy",
                role: "Largest U.S. operator of nuclear plants; signed a landmark deal to restart Three Mile Island for Microsoft AI compute.",
            },
            {
                ticker: "VST",
                name: "Vistra Corp",
                role: "Independent power producer with a growing nuclear and natural gas fleet supplying AI data center load.",
            },
            {
                ticker: "GEV",
                name: "GE Vernova",
                role: "Builds gas turbines, grid equipment and wind generation that backbone power for new AI campuses.",
            },
            {
                ticker: "ETR",
                name: "Entergy",
                role: "Regulated utility powering massive new AI data centers across the southern United States.",
            },
        ],
    },
    chips: {
        key: "chips",
        name: "Chips",
        order: 2,
        color: "#10b981",
        description:
            "Semiconductor designers, fabricators and equipment makers building the GPUs, accelerators and memory at the heart of every AI workload.",
        companies: [
            {
                ticker: "NVDA",
                name: "NVIDIA",
                role: "Designs the dominant GPU accelerators (H100, H200, Blackwell) used to train and serve frontier AI models.",
            },
            {
                ticker: "AMD",
                name: "Advanced Micro Devices",
                role: "Produces MI300/MI325 AI accelerators and EPYC CPUs that compete with NVIDIA in data center compute.",
            },
            {
                ticker: "TSM",
                name: "Taiwan Semiconductor",
                role: "Manufactures nearly all leading-edge AI chips in the world for NVIDIA, AMD, Apple and others.",
            },
            {
                ticker: "ASML",
                name: "ASML Holding",
                role: "Sole supplier of EUV lithography machines required to manufacture leading-edge AI chips.",
            },
            {
                ticker: "AVGO",
                name: "Broadcom",
                role: "Designs custom AI accelerators (TPUs for Google) and high-speed networking silicon for AI clusters.",
            },
            {
                ticker: "MU",
                name: "Micron Technology",
                role: "Supplies HBM3E high-bandwidth memory paired with GPUs in NVIDIA and AMD AI accelerators.",
            },
            {
                ticker: "INTC",
                name: "Intel",
                role: "Produces Xeon CPUs for AI servers and is investing heavily in U.S. foundry capacity (Intel 18A).",
            },
        ],
    },
    infrastructure: {
        key: "infrastructure",
        name: "Infrastructure",
        order: 3,
        color: "#3b82f6",
        description:
            "Hyperscale clouds, data center REITs and server OEMs that turn raw chips into the compute platforms used by AI developers.",
        companies: [
            {
                ticker: "MSFT",
                name: "Microsoft",
                role: "Operates Azure, the largest external compute partner of OpenAI, with hundreds of thousands of GPUs deployed.",
            },
            {
                ticker: "AMZN",
                name: "Amazon",
                role: "Runs AWS, the largest public cloud, with custom Trainium and Inferentia silicon and a major Anthropic partnership.",
            },
            {
                ticker: "ORCL",
                name: "Oracle",
                role: "Oracle Cloud Infrastructure provides dense GPU clusters used by OpenAI, xAI and others for AI training.",
            },
            {
                ticker: "DELL",
                name: "Dell Technologies",
                role: "Leading OEM building GPU-dense AI servers for hyperscalers and enterprise customers.",
            },
            {
                ticker: "EQIX",
                name: "Equinix",
                role: "Global colocation REIT providing the interconnection fabric that links AI clouds to enterprise networks.",
            },
            {
                ticker: "DLR",
                name: "Digital Realty",
                role: "Owns and operates large data center campuses leased to hyperscalers for AI training and inference.",
            },
            {
                ticker: "ANET",
                name: "Arista Networks",
                role: "Supplies the high-throughput Ethernet switches that connect tens of thousands of GPUs inside AI clusters.",
            },
        ],
    },
    models: {
        key: "models",
        name: "Models",
        order: 4,
        color: "#8b5cf6",
        description:
            "Companies developing the foundation models, AI platforms and proprietary research that power generative AI products.",
        companies: [
            {
                ticker: "GOOGL",
                name: "Alphabet",
                role: "Develops the Gemini family of frontier models and operates Google DeepMind, one of the leading AI research labs.",
            },
            {
                ticker: "META",
                name: "Meta Platforms",
                role: "Builds the open-weight Llama foundation models and operates one of the largest GPU fleets in the world.",
            },
            {
                ticker: "MSFT",
                name: "Microsoft",
                role: "Strategic investor and exclusive cloud partner of OpenAI; ships Copilot products powered by frontier GPT models.",
            },
            {
                ticker: "AMZN",
                name: "Amazon",
                role: "Multi-billion dollar investor in Anthropic and distributor of Claude through Amazon Bedrock.",
            },
            {
                ticker: "IBM",
                name: "IBM",
                role: "Develops the Granite family of enterprise foundation models and the watsonx AI platform.",
            },
            {
                ticker: "BIDU",
                name: "Baidu",
                role: "Operates the ERNIE family of Chinese-language foundation models used widely across Chinese enterprises.",
            },
        ],
    },
    application: {
        key: "application",
        name: "Application",
        order: 5,
        color: "#ef4444",
        description:
            "Software companies embedding AI into the products that end-users and enterprises actually consume day to day.",
        companies: [
            {
                ticker: "CRM",
                name: "Salesforce",
                role: "Embeds AI agents (Agentforce) and Einstein into the CRM workflows used by Fortune 500 sales and service teams.",
            },
            {
                ticker: "ADBE",
                name: "Adobe",
                role: "Ships Firefly generative AI inside Photoshop, Illustrator and the Creative Cloud suite.",
            },
            {
                ticker: "NOW",
                name: "ServiceNow",
                role: "Embeds Now Assist generative AI across IT service management and enterprise workflow automation.",
            },
            {
                ticker: "SNOW",
                name: "Snowflake",
                role: "Provides Cortex AI for running LLMs directly against governed enterprise data inside the data warehouse.",
            },
            {
                ticker: "PLTR",
                name: "Palantir Technologies",
                role: "AIP (Artificial Intelligence Platform) lets enterprises and governments wire LLMs into operational decision making.",
            },
            {
                ticker: "CRWD",
                name: "CrowdStrike",
                role: "Uses AI in the Falcon platform to detect, triage and respond to security threats in real time.",
            },
            {
                ticker: "DUOL",
                name: "Duolingo",
                role: "Consumer learning app that ships AI tutoring features (Duolingo Max) built on top of GPT models.",
            },
        ],
    },
};

function getAllCompanies() {
    const result = [];
    for (const layer of Object.values(layers)) {
        for (const company of layer.companies) {
            result.push({ ...company, layer: layer.key, layerName: layer.name });
        }
    }
    return result;
}

function getLayer(key) {
    return layers[key] || null;
}

function getCompany(ticker) {
    const upper = ticker.toUpperCase();
    for (const layer of Object.values(layers)) {
        const found = layer.companies.find((c) => c.ticker === upper);
        if (found) return { ...found, layer: layer.key, layerName: layer.name };
    }
    return null;
}

module.exports = { layers, getAllCompanies, getLayer, getCompany };
