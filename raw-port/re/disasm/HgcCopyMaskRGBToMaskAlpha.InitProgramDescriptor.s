__ZNK25HgcCopyMaskRGBToMaskAlpha21InitProgramDescriptorEP19HGProgramDescriptor:
00000000006a2080	pushq	%rbp
00000000006a2081	movq	%rsp, %rbp
00000000006a2084	subq	$0xf0, %rsp
00000000006a208b	movq	%rdi, -0x8(%rbp)
00000000006a208f	movq	%rsi, -0x10(%rbp)
00000000006a2093	movq	-0x10(%rbp), %rax
00000000006a2097	movq	%rax, -0xe0(%rbp)
00000000006a209e	callq	__ZL42GetHgcCopyMaskRGBToMaskAlphaVisibleProgramv ## GetHgcCopyMaskRGBToMaskAlphaVisibleProgram()
00000000006a20a3	movq	-0xe0(%rbp), %rdi
00000000006a20aa	movq	%rax, %rdx
00000000006a20ad	leaq	0x156d1e(%rip), %rsi            ## literal pool for: "HgcCopyMaskRGBToMaskAlpha_hgc_visible"
00000000006a20b4	callq	0x6de520                        ## symbol stub for: __ZN19HGProgramDescriptor26SetVisibleShaderWithSourceEPKcS1_
00000000006a20b9	movq	-0x10(%rbp), %rdi
00000000006a20bd	leaq	0x156d34(%rip), %rsi            ## literal pool for: "HgcCopyMaskRGBToMaskAlpha"
00000000006a20c4	callq	0x6de51a                        ## symbol stub for: __ZN19HGProgramDescriptor23SetFragmentFunctionNameEPKc
00000000006a20c9	movq	-0x10(%rbp), %rax
00000000006a20cd	movq	%rax, -0xd8(%rbp)
00000000006a20d4	movq	%rsp, %rax
00000000006a20d7	movl	$0x0, (%rax)
00000000006a20dd	leaq	0x15386a(%rip), %rdx            ## literal pool for: "FragmentOut"
00000000006a20e4	leaq	-0x40(%rbp), %rdi
00000000006a20e8	movq	%rdi, -0xd0(%rbp)
00000000006a20ef	movl	$0x4, %esi
00000000006a20f4	xorl	%r8d, %r8d
00000000006a20f7	movl	$0x1, %r9d
00000000006a20fd	movl	%r8d, %ecx
00000000006a2100	callq	__ZN9HGBindingC1ENS_9AttributeEPKcjNS_9AddrSpaceEjt ## HGBinding::HGBinding(HGBinding::Attribute, char const*, unsigned int, HGBinding::AddrSpace, unsigned int, unsigned short)
00000000006a2105	movq	-0xd8(%rbp), %rdi
00000000006a210c	movq	-0xd0(%rbp), %rsi
00000000006a2113	callq	0x6de50e                        ## symbol stub for: __ZN19HGProgramDescriptor16SetReturnBindingE9HGBinding
00000000006a2118	jmp	0x6a211a
00000000006a211a	leaq	-0x40(%rbp), %rdi
00000000006a211e	callq	__ZN9HGBindingD1Ev              ## HGBinding::~HGBinding()
00000000006a2123	leaq	-0x68(%rbp), %rdi
00000000006a2127	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEEC1B9dee210106Ev ## std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::vector[abi:dee210106]()
00000000006a212c	movq	%rsp, %rax
00000000006a212f	movl	$0x0, (%rax)
00000000006a2135	leaq	0x15381e(%rip), %rdx            ## literal pool for: "float4"
00000000006a213c	leaq	-0x98(%rbp), %rdi
00000000006a2143	movl	$0x2, %esi
00000000006a2148	movl	$0x3, %r8d
00000000006a214e	xorl	%r9d, %r9d
00000000006a2151	movl	%r9d, %ecx
00000000006a2154	callq	__ZN9HGBindingC1ENS_9AttributeEPKcjNS_9AddrSpaceEjt ## HGBinding::HGBinding(HGBinding::Attribute, char const*, unsigned int, HGBinding::AddrSpace, unsigned int, unsigned short)
00000000006a2159	jmp	0x6a215b
00000000006a215b	leaq	-0x68(%rbp), %rdi
00000000006a215f	leaq	-0x98(%rbp), %rsi
00000000006a2166	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE9push_backB9dee210106EOS1_ ## std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::push_back[abi:dee210106](HGBinding&&)
00000000006a216b	jmp	0x6a216d
00000000006a216d	leaq	-0x98(%rbp), %rdi
00000000006a2174	callq	__ZN9HGBindingD1Ev              ## HGBinding::~HGBinding()
00000000006a2179	movq	%rsp, %rax
00000000006a217c	movl	$0x0, (%rax)
00000000006a2182	leaq	0x1537d1(%rip), %rdx            ## literal pool for: "float4"
00000000006a2189	leaq	-0xc8(%rbp), %rdi
00000000006a2190	movl	$0xa, %esi
00000000006a2195	xorl	%r8d, %r8d
00000000006a2198	movl	$0x1, %r9d
00000000006a219e	movl	%r8d, %ecx
00000000006a21a1	callq	__ZN9HGBindingC1ENS_9AttributeEPKcjNS_9AddrSpaceEjt ## HGBinding::HGBinding(HGBinding::Attribute, char const*, unsigned int, HGBinding::AddrSpace, unsigned int, unsigned short)
00000000006a21a6	jmp	0x6a21a8
00000000006a21a8	leaq	-0x68(%rbp), %rdi
00000000006a21ac	leaq	-0xc8(%rbp), %rsi
00000000006a21b3	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE9push_backB9dee210106EOS1_ ## std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::push_back[abi:dee210106](HGBinding&&)
00000000006a21b8	jmp	0x6a21ba
00000000006a21ba	leaq	-0xc8(%rbp), %rdi
00000000006a21c1	callq	__ZN9HGBindingD1Ev              ## HGBinding::~HGBinding()
00000000006a21c6	movq	-0x10(%rbp), %rdi
00000000006a21ca	leaq	-0x68(%rbp), %rsi
00000000006a21ce	callq	0x6de514                        ## symbol stub for: __ZN19HGProgramDescriptor19SetArgumentBindingsERKNSt3__16vectorI9HGBindingNS0_9allocatorIS2_EEEE
00000000006a21d3	jmp	0x6a21d5
00000000006a21d5	leaq	-0x68(%rbp), %rdi
00000000006a21d9	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEED1B9dee210106Ev ## std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::~vector[abi:dee210106]()
00000000006a21de	addq	$0xf0, %rsp
00000000006a21e5	popq	%rbp
00000000006a21e6	retq
00000000006a21e7	movq	%rax, %rcx
00000000006a21ea	movl	%edx, %eax
00000000006a21ec	movq	%rcx, -0x48(%rbp)
00000000006a21f0	movl	%eax, -0x4c(%rbp)
00000000006a21f3	leaq	-0x40(%rbp), %rdi
00000000006a21f7	callq	__ZN9HGBindingD1Ev              ## HGBinding::~HGBinding()
00000000006a21fc	jmp	0x6a2247
00000000006a21fe	movq	%rax, %rcx
00000000006a2201	movl	%edx, %eax
00000000006a2203	movq	%rcx, -0x48(%rbp)
00000000006a2207	movl	%eax, -0x4c(%rbp)
00000000006a220a	jmp	0x6a223e
00000000006a220c	movq	%rax, %rcx
00000000006a220f	movl	%edx, %eax
00000000006a2211	movq	%rcx, -0x48(%rbp)
00000000006a2215	movl	%eax, -0x4c(%rbp)
00000000006a2218	leaq	-0x98(%rbp), %rdi
00000000006a221f	callq	__ZN9HGBindingD1Ev              ## HGBinding::~HGBinding()
00000000006a2224	jmp	0x6a223e
00000000006a2226	movq	%rax, %rcx
00000000006a2229	movl	%edx, %eax
00000000006a222b	movq	%rcx, -0x48(%rbp)
00000000006a222f	movl	%eax, -0x4c(%rbp)
00000000006a2232	leaq	-0xc8(%rbp), %rdi
00000000006a2239	callq	__ZN9HGBindingD1Ev              ## HGBinding::~HGBinding()
00000000006a223e	leaq	-0x68(%rbp), %rdi
00000000006a2242	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEED1B9dee210106Ev ## std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::~vector[abi:dee210106]()
00000000006a2247	movq	-0x48(%rbp), %rdi
00000000006a224b	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
