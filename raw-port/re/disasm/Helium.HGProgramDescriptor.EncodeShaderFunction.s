__ZNK19HGProgramDescriptor20EncodeShaderFunctionERNSt3__112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE:
0000000000168ec0	pushq	%rbp
0000000000168ec1	movq	%rsp, %rbp
0000000000168ec4	pushq	%r15
0000000000168ec6	pushq	%r14
0000000000168ec8	pushq	%r13
0000000000168eca	pushq	%r12
0000000000168ecc	pushq	%rbx
0000000000168ecd	subq	$0x1d8, %rsp                    ## imm = 0x1D8
0000000000168ed4	movq	%rsi, %r13
0000000000168ed7	movq	%rdi, %rbx
0000000000168eda	movq	0x899377(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
0000000000168ee1	movq	(%rax), %rax
0000000000168ee4	movq	%rax, -0x30(%rbp)
0000000000168ee8	movzbl	0x40(%rdi), %eax
0000000000168eec	testb	$0x1, %al
0000000000168eee	jne	0x168f10
0000000000168ef0	shrl	%eax
0000000000168ef2	movzbl	0x58(%rbx), %ecx
0000000000168ef6	testb	$0x1, %cl
0000000000168ef9	je	0x168f1d
0000000000168efb	movq	0x60(%rbx), %rcx
0000000000168eff	movb	$0x1, %dl
0000000000168f01	testq	%rcx, %rcx
0000000000168f04	je	0x168f26
0000000000168f06	testq	%rax, %rax
0000000000168f09	jne	0x168f5a
0000000000168f0b	jmp	0x16a6be
0000000000168f10	movq	0x48(%rbx), %rax
0000000000168f14	movzbl	0x58(%rbx), %ecx
0000000000168f18	testb	$0x1, %cl
0000000000168f1b	jne	0x168efb
0000000000168f1d	shrl	%ecx
0000000000168f1f	movb	$0x1, %dl
0000000000168f21	testq	%rcx, %rcx
0000000000168f24	jne	0x168f06
0000000000168f26	movzbl	0xa0(%rbx), %ecx
0000000000168f2d	testb	$0x1, %cl
0000000000168f30	jne	0x168f44
0000000000168f32	shrl	%ecx
0000000000168f34	testq	%rcx, %rcx
0000000000168f37	setne	%dl
0000000000168f3a	testq	%rax, %rax
0000000000168f3d	jne	0x168f5a
0000000000168f3f	jmp	0x16a6be
0000000000168f44	movq	0xa8(%rbx), %rcx
0000000000168f4b	testq	%rcx, %rcx
0000000000168f4e	setne	%dl
0000000000168f51	testq	%rax, %rax
0000000000168f54	je	0x16a6be
0000000000168f5a	testb	%dl, %dl
0000000000168f5c	je	0x16a6be
0000000000168f62	movq	(%r13), %rax
0000000000168f66	andq	$-0x2, %rax
0000000000168f6a	addq	$0x7ff, %rax                    ## imm = 0x7FF
0000000000168f70	testb	$0x1, (%r13)
0000000000168f75	movl	$0x816, %esi                    ## imm = 0x816
0000000000168f7a	cmovneq	%rax, %rsi
0000000000168f7e	movq	%r13, %rdi
0000000000168f81	callq	0x3c4e56                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEm
0000000000168f86	xorps	%xmm0, %xmm0
0000000000168f89	movaps	%xmm0, -0x120(%rbp)
0000000000168f90	movq	$0x0, -0x110(%rbp)
0000000000168f9b	movl	$0x7, -0x150(%rbp)
0000000000168fa5	movb	$0x14, -0x148(%rbp)
0000000000168fac	movabsq	$0x6144786574726556, %rax       ## imm = 0x6144786574726556
0000000000168fb6	movq	%rax, -0x147(%rbp)
0000000000168fbd	movw	$0x6174, -0x13f(%rbp)           ## imm = 0x6174
0000000000168fc6	movb	$0x0, -0x13d(%rbp)
0000000000168fcd	movaps	0x2620bc(%rip), %xmm0
0000000000168fd4	movups	%xmm0, -0x130(%rbp)
0000000000168fdb	leaq	-0x120(%rbp), %rdi
0000000000168fe2	leaq	-0x150(%rbp), %rsi
0000000000168fe9	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
0000000000168fee	movq	%rax, -0x118(%rbp)
0000000000168ff5	testb	$0x1, -0x148(%rbp)
0000000000168ffc	je	0x169011
0000000000168ffe	movq	-0x138(%rbp), %rdi
0000000000169005	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016900a	movq	-0x118(%rbp), %rax
0000000000169011	movl	$0x2, -0x150(%rbp)
000000000016901b	movb	$0x20, -0x148(%rbp)
0000000000169022	movups	0x782090(%rip), %xmm0           ## literal pool for: "ShaderParameters"
0000000000169029	movups	%xmm0, -0x147(%rbp)
0000000000169030	movb	$0x0, -0x137(%rbp)
0000000000169037	movaps	0x6f1e62(%rip), %xmm0
000000000016903e	movups	%xmm0, -0x130(%rbp)
0000000000169045	cmpq	-0x110(%rbp), %rax
000000000016904c	jae	0x16908d
000000000016904e	leaq	-0x148(%rbp), %rcx
0000000000169055	movl	$0x2, (%rax)
000000000016905b	movq	0x10(%rcx), %rdx
000000000016905f	movq	%rdx, 0x18(%rax)
0000000000169063	movups	(%rcx), %xmm0
0000000000169066	movups	%xmm0, 0x8(%rax)
000000000016906a	xorps	%xmm0, %xmm0
000000000016906d	movups	%xmm0, (%rcx)
0000000000169070	movq	$0x0, 0x10(%rcx)
0000000000169078	movups	0x18(%rcx), %xmm0
000000000016907c	movups	%xmm0, 0x20(%rax)
0000000000169080	addq	$0x30, %rax
0000000000169084	movq	%rax, -0x118(%rbp)
000000000016908b	jmp	0x1690bc
000000000016908d	leaq	-0x120(%rbp), %rdi
0000000000169094	leaq	-0x150(%rbp), %rsi
000000000016909b	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE24__emplace_back_slow_pathIJS1_EEEPS1_DpOT_ ## HGBinding* std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::__emplace_back_slow_path<HGBinding>(HGBinding&&)
00000000001690a0	testb	$0x1, -0x148(%rbp)
00000000001690a7	movq	%rax, -0x118(%rbp)
00000000001690ae	je	0x1690bc
00000000001690b0	movq	-0x138(%rbp), %rdi
00000000001690b7	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001690bc	xorps	%xmm0, %xmm0
00000000001690bf	movaps	%xmm0, -0x140(%rbp)
00000000001690c6	movaps	%xmm0, -0x150(%rbp)
00000000001690cd	movl	$0x3f800000, -0x130(%rbp)       ## imm = 0x3F800000
00000000001690d7	movq	$0x0, -0x1e0(%rbp)
00000000001690e2	movq	$0x0, -0x1c8(%rbp)
00000000001690ed	movq	$0x0, -0x1d8(%rbp)
00000000001690f8	movq	$0x0, -0x1d0(%rbp)
0000000000169103	movb	$0x0, -0x71(%rbp)
0000000000169107	movaps	%xmm0, -0x170(%rbp)
000000000016910e	movq	$0x0, -0x160(%rbp)
0000000000169119	leaq	-0x170(%rbp), %rdi
0000000000169120	movl	$0x400, %esi                    ## imm = 0x400
0000000000169125	callq	0x3c4e56                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEm
000000000016912a	leaq	0x772534(%rip), %rsi            ## literal pool for: "{\n"
0000000000169131	leaq	-0x170(%rbp), %rdi
0000000000169138	callq	0x3c4e38                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc
000000000016913d	leaq	-0x71(%rbp), %rax
0000000000169141	movq	%rax, 0x10(%rsp)
0000000000169146	leaq	-0x1d0(%rbp), %rax
000000000016914d	movq	%rax, 0x8(%rsp)
0000000000169152	leaq	-0x1d8(%rbp), %rax
0000000000169159	movq	%rax, (%rsp)
000000000016915d	leaq	-0x170(%rbp), %rsi
0000000000169164	leaq	-0x120(%rbp), %rdx
000000000016916b	leaq	-0x150(%rbp), %rcx
0000000000169172	leaq	-0x1e0(%rbp), %r14
0000000000169179	leaq	-0x1c8(%rbp), %r9
0000000000169180	movq	%rbx, %rdi
0000000000169183	movq	%r14, %r8
0000000000169186	callq	__ZNK19HGProgramDescriptor27privateEncodeShaderFunctionERNSt3__112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEERNS0_6vectorI9HGBindingNS4_IS9_EEEERNS0_13unordered_mapImS6_NS0_4hashImEENS0_8equal_toImEENS4_INS0_4pairIKmS6_EEEEEERmSO_SO_SO_Rb ## HGProgramDescriptor::privateEncodeShaderFunction(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>&, std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>&, std::__1::unordered_map<unsigned long, std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>, std::__1::hash<unsigned long>, std::__1::equal_to<unsigned long>, std::__1::allocator<std::__1::pair<unsigned long const, std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>>>>&, unsigned long&, unsigned long&, unsigned long&, unsigned long&, bool&) const
000000000016918b	movb	$0x8, -0x70(%rbp)
000000000016918f	movl	$0x20202020, -0x6f(%rbp)        ## imm = 0x20202020
0000000000169196	movb	$0x0, -0x6b(%rbp)
000000000016919a	leaq	0x781f29(%rip), %rsi            ## literal pool for: "return "
00000000001691a1	leaq	-0x70(%rbp), %rdi
00000000001691a5	callq	0x3c4e38                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc
00000000001691aa	movq	0x10(%rax), %rcx
00000000001691ae	movq	%rcx, -0xa0(%rbp)
00000000001691b5	movups	(%rax), %xmm0
00000000001691b8	movaps	%xmm0, -0xb0(%rbp)
00000000001691bf	xorps	%xmm0, %xmm0
00000000001691c2	movups	%xmm0, (%rax)
00000000001691c5	movq	$0x0, 0x10(%rax)
00000000001691cd	movq	%r14, -0x50(%rbp)
00000000001691d1	leaq	__ZNSt3__119piecewise_constructE(%rip), %rdx ## std::__1::piecewise_construct
00000000001691d8	leaq	-0x150(%rbp), %rdi
00000000001691df	leaq	-0x50(%rbp), %rcx
00000000001691e3	leaq	-0x90(%rbp), %r8
00000000001691ea	movq	%r14, %rsi
00000000001691ed	callq	__ZNSt3__112__hash_tableINS_17__hash_value_typeImNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEEENS_22__unordered_map_hasherImNS_4pairIKmS7_EENS_4hashImEENS_8equal_toImEELb1EEENS_21__unordered_map_equalImSC_SG_SE_Lb1EEENS5_ISC_EEE25__emplace_unique_key_argsImJRKNS_21piecewise_construct_tENS_5tupleIJRSB_EEENSQ_IJEEEEEENSA_INS_15__hash_iteratorIPNS_11__hash_nodeIS8_PvEEEEbEERKT_DpOT0_ ## std::__1::pair<std::__1::__hash_iterator<std::__1::__hash_node<std::__1::__hash_value_type<unsigned long, std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>>, void*>*>, bool> std::__1::__hash_table<std::__1::__hash_value_type<unsigned long, std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>>, std::__1::__unordered_map_hasher<unsigned long, std::__1::pair<unsigned long const, std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>>, std::__1::hash<unsigned long>, std::__1::equal_to<unsigned long>, true>, std::__1::__unordered_map_equal<unsigned long, std::__1::pair<unsigned long const, std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>>, std::__1::equal_to<unsigned long>, std::__1::hash<unsigned long>, true>, std::__1::allocator<std::__1::pair<unsigned long const, std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>>>>::__emplace_unique_key_args<unsigned long, std::__1::piecewise_construct_t const&, std::__1::tuple<unsigned long const&>, std::__1::tuple<>>(unsigned long const&, std::__1::piecewise_construct_t const&, std::__1::tuple<unsigned long const&>&&, std::__1::tuple<>&&)
00000000001691f2	movzbl	0x18(%rax), %edx
00000000001691f6	testb	$0x1, %dl
00000000001691f9	je	0x169205
00000000001691fb	movq	0x20(%rax), %rdx
00000000001691ff	movq	0x28(%rax), %rax
0000000000169203	jmp	0x16920b
0000000000169205	addq	$0x19, %rax
0000000000169209	shrl	%edx
000000000016920b	leaq	-0xb0(%rbp), %rdi
0000000000169212	movq	%rax, %rsi
0000000000169215	callq	0x3c4e3e                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcm
000000000016921a	movq	0x10(%rax), %rcx
000000000016921e	movq	%rcx, -0xe0(%rbp)
0000000000169225	movups	(%rax), %xmm0
0000000000169228	movaps	%xmm0, -0xf0(%rbp)
000000000016922f	xorps	%xmm0, %xmm0
0000000000169232	movups	%xmm0, (%rax)
0000000000169235	movq	$0x0, 0x10(%rax)
000000000016923d	leaq	0x772578(%rip), %rsi            ## literal pool for: ";\n"
0000000000169244	leaq	-0xf0(%rbp), %rdi
000000000016924b	callq	0x3c4e38                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc
0000000000169250	movq	0x10(%rax), %rcx
0000000000169254	movq	%rcx, -0xc0(%rbp)
000000000016925b	movups	(%rax), %xmm0
000000000016925e	movaps	%xmm0, -0xd0(%rbp)
0000000000169265	xorps	%xmm0, %xmm0
0000000000169268	movups	%xmm0, (%rax)
000000000016926b	movq	$0x0, 0x10(%rax)
0000000000169273	movzbl	-0xd0(%rbp), %edx
000000000016927a	testb	$0x1, %dl
000000000016927d	je	0x16928f
000000000016927f	movq	-0xc0(%rbp), %rsi
0000000000169286	movq	-0xc8(%rbp), %rdx
000000000016928d	jmp	0x169298
000000000016928f	shrl	%edx
0000000000169291	leaq	-0xcf(%rbp), %rsi
0000000000169298	leaq	-0x170(%rbp), %rdi
000000000016929f	callq	0x3c4e3e                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcm
00000000001692a4	testb	$0x1, -0xd0(%rbp)
00000000001692ab	jne	0x16937f
00000000001692b1	testb	$0x1, -0xf0(%rbp)
00000000001692b8	jne	0x169398
00000000001692be	testb	$0x1, -0xb0(%rbp)
00000000001692c5	jne	0x1693b1
00000000001692cb	testb	$0x1, -0x70(%rbp)
00000000001692cf	je	0x1692da
00000000001692d1	movq	-0x60(%rbp), %rdi
00000000001692d5	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001692da	leaq	0x781df1(%rip), %rsi            ## literal pool for: "};"
00000000001692e1	leaq	-0x170(%rbp), %rdi
00000000001692e8	callq	0x3c4e38                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc
00000000001692ed	xorps	%xmm0, %xmm0
00000000001692f0	movaps	%xmm0, -0xd0(%rbp)
00000000001692f7	movq	$0x0, -0xc0(%rbp)
0000000000169302	leaq	-0xd0(%rbp), %rdi
0000000000169309	movl	$0x400, %esi                    ## imm = 0x400
000000000016930e	callq	0x3c4e56                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEm
0000000000169313	leaq	0xc0(%rbx), %rdx
000000000016931a	leaq	0x781db4(%rip), %rsi            ## literal pool for: "[[ fragment ]] "
0000000000169321	leaq	-0xb0(%rbp), %rdi
0000000000169328	callq	0x3c4f82                        ## symbol stub for: __ZNSt3__1plIcNS_11char_traitsIcEENS_9allocatorIcEEEENS_12basic_stringIT_T0_T1_EEPKS6_RKS9_
000000000016932d	leaq	0x755510(%rip), %rsi            ## literal pool for: " "
0000000000169334	leaq	-0xb0(%rbp), %rdi
000000000016933b	callq	0x3c4e38                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc
0000000000169340	movq	0x10(%rax), %rcx
0000000000169344	movq	%rcx, -0xe0(%rbp)
000000000016934b	movups	(%rax), %xmm0
000000000016934e	movaps	%xmm0, -0xf0(%rbp)
0000000000169355	xorps	%xmm0, %xmm0
0000000000169358	movups	%xmm0, (%rax)
000000000016935b	movq	$0x0, 0x10(%rax)
0000000000169363	movzbl	-0xf0(%rbp), %edx
000000000016936a	testb	$0x1, %dl
000000000016936d	je	0x1693cc
000000000016936f	movq	-0xe0(%rbp), %rsi
0000000000169376	movq	-0xe8(%rbp), %rdx
000000000016937d	jmp	0x1693d5
000000000016937f	movq	-0xc0(%rbp), %rdi
0000000000169386	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016938b	testb	$0x1, -0xf0(%rbp)
0000000000169392	je	0x1692be
0000000000169398	movq	-0xe0(%rbp), %rdi
000000000016939f	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001693a4	testb	$0x1, -0xb0(%rbp)
00000000001693ab	je	0x1692cb
00000000001693b1	movq	-0xa0(%rbp), %rdi
00000000001693b8	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000001693bd	testb	$0x1, -0x70(%rbp)
00000000001693c1	jne	0x1692d1
00000000001693c7	jmp	0x1692da
00000000001693cc	shrl	%edx
00000000001693ce	leaq	-0xef(%rbp), %rsi
00000000001693d5	leaq	-0xd0(%rbp), %rdi
00000000001693dc	callq	0x3c4e3e                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcm
00000000001693e1	testb	$0x1, -0xf0(%rbp)
00000000001693e8	jne	0x169441
00000000001693ea	testb	$0x1, -0xb0(%rbp)
00000000001693f1	jne	0x169456
00000000001693f3	movzbl	0x28(%rbx), %eax
00000000001693f7	testb	$0x1, %al
00000000001693f9	jne	0x16946a
00000000001693fb	addq	$0x29, %rbx
00000000001693ff	testb	%al, %al
0000000000169401	leaq	0x75180f(%rip), %r14            ## literal pool for: "fragmentFunc"
0000000000169408	cmovneq	%rbx, %r14
000000000016940c	movq	%r14, %rdi
000000000016940f	callq	0x3c5612                        ## symbol stub for: _strlen
0000000000169414	cmpq	$-0x9, %rax
0000000000169418	jae	0x169487
000000000016941a	movq	%rax, %rbx
000000000016941d	cmpq	$0x17, %rax
0000000000169421	jae	0x169491
0000000000169423	leal	(%rbx,%rbx), %eax
0000000000169426	movb	%al, -0xf0(%rbp)
000000000016942c	leaq	-0xef(%rbp), %r15
0000000000169433	testq	%rbx, %rbx
0000000000169436	jne	0x1694ce
000000000016943c	jmp	0x1694dc
0000000000169441	movq	-0xe0(%rbp), %rdi
0000000000169448	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016944d	testb	$0x1, -0xb0(%rbp)
0000000000169454	je	0x1693f3
0000000000169456	movq	-0xa0(%rbp), %rdi
000000000016945d	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000169462	movzbl	0x28(%rbx), %eax
0000000000169466	testb	$0x1, %al
0000000000169468	je	0x1693fb
000000000016946a	cmpq	$0x0, 0x30(%rbx)
000000000016946f	je	0x16a6e0
0000000000169475	movq	0x38(%rbx), %r14
0000000000169479	movq	%r14, %rdi
000000000016947c	callq	0x3c5612                        ## symbol stub for: _strlen
0000000000169481	cmpq	$-0x9, %rax
0000000000169485	jb	0x16941a
0000000000169487	callq	__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE20__throw_length_errorB9nqe210106Ev ## std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>::__throw_length_error[abi:nqe210106]()
000000000016948c	jmp	0x16a72b
0000000000169491	movq	%rbx, %rax
0000000000169494	orq	$0x7, %rax
0000000000169498	leaq	0x1(%rax), %rcx
000000000016949c	cmpq	$0x17, %rax
00000000001694a0	movl	$0x1a, %r12d
00000000001694a6	cmovneq	%rcx, %r12
00000000001694aa	movq	%r12, %rdi
00000000001694ad	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000001694b2	movq	%rax, %r15
00000000001694b5	movq	%rax, -0xe0(%rbp)
00000000001694bc	orq	$0x1, %r12
00000000001694c0	movq	%r12, -0xf0(%rbp)
00000000001694c7	movq	%rbx, -0xe8(%rbp)
00000000001694ce	movq	%r15, %rdi
00000000001694d1	movq	%r14, %rsi
00000000001694d4	movq	%rbx, %rdx
00000000001694d7	callq	0x3c543e                        ## symbol stub for: _memmove
00000000001694dc	movb	$0x0, (%r15,%rbx)
00000000001694e1	movzbl	-0xf0(%rbp), %ebx
00000000001694e8	movl	%ebx, %ecx
00000000001694ea	movq	-0xe0(%rbp), %rax
00000000001694f1	andb	$0x1, %cl
00000000001694f4	movb	%cl, -0x100(%rbp)
00000000001694fa	movq	%r13, -0x1a8(%rbp)
0000000000169501	je	0x16950f
0000000000169503	movq	-0xe8(%rbp), %rbx
000000000016950a	movq	%rax, %r14
000000000016950d	jmp	0x169518
000000000016950f	shrl	%ebx
0000000000169511	leaq	-0xef(%rbp), %r14
0000000000169518	leaq	0x1(%rbx), %r13
000000000016951c	cmpq	$-0x9, %r13
0000000000169520	jae	0x16a71f
0000000000169526	movq	%rax, -0x1a0(%rbp)
000000000016952d	cmpq	$0x17, %r13
0000000000169531	jae	0x169584
0000000000169533	xorps	%xmm0, %xmm0
0000000000169536	movaps	%xmm0, -0xb0(%rbp)
000000000016953d	movq	$0x0, -0xa0(%rbp)
0000000000169548	addb	%r13b, %r13b
000000000016954b	movb	%r13b, -0xb0(%rbp)
0000000000169552	leaq	-0xaf(%rbp), %r12
0000000000169559	movq	%r12, %r15
000000000016955c	testq	%rbx, %rbx
000000000016955f	jne	0x1695c8
0000000000169561	movw	$0x28, (%r12,%rbx)
0000000000169568	movzbl	-0xb0(%rbp), %edx
000000000016956f	testb	$0x1, %dl
0000000000169572	je	0x1695e9
0000000000169574	movq	-0xa0(%rbp), %r15
000000000016957b	movq	-0xa8(%rbp), %rdx
0000000000169582	jmp	0x1695eb
0000000000169584	movq	%r13, %rax
0000000000169587	orq	$0x7, %rax
000000000016958b	leaq	0x1(%rax), %rcx
000000000016958f	cmpq	$0x17, %rax
0000000000169593	movl	$0x1a, %r15d
0000000000169599	cmovneq	%rcx, %r15
000000000016959d	movq	%r15, %rdi
00000000001695a0	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000001695a5	movq	%rax, %r12
00000000001695a8	orq	$0x1, %r15
00000000001695ac	movq	%r15, -0xb0(%rbp)
00000000001695b3	movq	%rax, -0xa0(%rbp)
00000000001695ba	movq	%r13, -0xa8(%rbp)
00000000001695c1	leaq	-0xaf(%rbp), %r15
00000000001695c8	movq	%r12, %rdi
00000000001695cb	movq	%r14, %rsi
00000000001695ce	movq	%rbx, %rdx
00000000001695d1	callq	0x3c5438                        ## symbol stub for: _memcpy
00000000001695d6	movw	$0x28, (%r12,%rbx)
00000000001695dd	movzbl	-0xb0(%rbp), %edx
00000000001695e4	testb	$0x1, %dl
00000000001695e7	jne	0x169574
00000000001695e9	shrl	%edx
00000000001695eb	leaq	-0xd0(%rbp), %rdi
00000000001695f2	movq	%r15, %rsi
00000000001695f5	callq	0x3c4e3e                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcm
00000000001695fa	testb	$0x1, -0xb0(%rbp)
0000000000169601	je	0x16960f
0000000000169603	movq	-0xa0(%rbp), %rdi
000000000016960a	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016960f	movw	$0x0, -0xb0(%rbp)
0000000000169618	movq	-0x120(%rbp), %r15
000000000016961f	movq	-0x118(%rbp), %rax
0000000000169626	movq	%rax, -0x100(%rbp)
000000000016962d	cmpq	%rax, %r15
0000000000169630	je	0x169fa8
0000000000169636	leaq	-0xaf(%rbp), %r13
000000000016963d	movq	$0x0, -0x180(%rbp)
0000000000169648	leaq	-0x90(%rbp), %rbx
000000000016964f	movq	$0x0, -0x178(%rbp)
000000000016965a	jmp	0x169678
000000000016965c	nopl	(%rax)
0000000000169660	addq	$0x30, %r15
0000000000169664	cmpq	-0x100(%rbp), %r15
000000000016966b	leaq	-0x90(%rbp), %rbx
0000000000169672	je	0x169fa8
0000000000169678	movzbl	-0xb0(%rbp), %edx
000000000016967f	testb	$0x1, %dl
0000000000169682	je	0x1696a0
0000000000169684	movq	-0xa0(%rbp), %rsi
000000000016968b	movq	-0xa8(%rbp), %rdx
0000000000169692	jmp	0x1696a5
0000000000169694	nopw	%cs:(%rax,%rax)
00000000001696a0	shrl	%edx
00000000001696a2	movq	%r13, %rsi
00000000001696a5	leaq	-0xd0(%rbp), %rdi
00000000001696ac	callq	0x3c4e3e                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcm
00000000001696b1	movl	(%r15), %eax
00000000001696b4	addl	$-0x2, %eax
00000000001696b7	cmpl	$0x7, %eax
00000000001696ba	ja	0x169eb0
00000000001696c0	leaq	0x1511(%rip), %rcx
00000000001696c7	movslq	(%rcx,%rax,4), %rax
00000000001696cb	addq	%rcx, %rax
00000000001696ce	jmpq	*%rax
00000000001696d0	movl	0x24(%r15), %eax
00000000001696d4	decl	%eax
00000000001696d6	cmpl	$0x3, %eax
00000000001696d9	ja	0x1696f4
00000000001696db	movl	%eax, %eax
00000000001696dd	leaq	0x8b78ac(%rip), %rcx
00000000001696e4	movq	(%rcx,%rax,8), %rsi
00000000001696e8	leaq	-0xd0(%rbp), %rdi
00000000001696ef	callq	0x3c4e38                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc
00000000001696f4	movzbl	0x8(%r15), %edx
00000000001696f9	testb	$0x1, %dl
00000000001696fc	je	0x169898
0000000000169702	movq	0x18(%r15), %rsi
0000000000169706	movq	0x10(%r15), %rdx
000000000016970a	jmp	0x16989e
000000000016970f	movzbl	0x8(%r15), %r12d
0000000000169714	testb	$0x1, %r12b
0000000000169718	je	0x169778
000000000016971a	movq	0x18(%r15), %rsi
000000000016971e	movq	0x10(%r15), %r12
0000000000169722	jmp	0x16977f
0000000000169724	movzbl	0x8(%r15), %r12d
0000000000169729	testb	$0x1, %r12b
000000000016972d	je	0x1697c0
0000000000169733	movq	0x18(%r15), %rsi
0000000000169737	movq	0x10(%r15), %r12
000000000016973b	jmp	0x1697c7
0000000000169740	movzbl	0x8(%r15), %r12d
0000000000169745	testb	$0x1, %r12b
0000000000169749	je	0x169808
000000000016974f	movq	0x18(%r15), %rsi
0000000000169753	movq	0x10(%r15), %r12
0000000000169757	jmp	0x16980f
000000000016975c	movzbl	0x8(%r15), %r12d
0000000000169761	testb	$0x1, %r12b
0000000000169765	je	0x169850
000000000016976b	movq	0x18(%r15), %rsi
000000000016976f	movq	0x10(%r15), %r12
0000000000169773	jmp	0x169857
0000000000169778	leaq	0x9(%r15), %rsi
000000000016977c	shrl	%r12d
000000000016977f	leaq	0x8(%r12), %r13
0000000000169784	cmpq	$-0x9, %r13
0000000000169788	jae	0x16a705
000000000016978e	cmpq	$0x17, %r13
0000000000169792	jae	0x1698e6
0000000000169798	xorps	%xmm0, %xmm0
000000000016979b	movaps	%xmm0, -0x50(%rbp)
000000000016979f	movq	$0x0, -0x40(%rbp)
00000000001697a7	addb	%r13b, %r13b
00000000001697aa	movb	%r13b, -0x50(%rbp)
00000000001697ae	leaq	-0x4f(%rbp), %r14
00000000001697b2	testq	%r12, %r12
00000000001697b5	jne	0x16992e
00000000001697bb	jmp	0x169939
00000000001697c0	leaq	0x9(%r15), %rsi
00000000001697c4	shrl	%r12d
00000000001697c7	leaq	0x1(%r12), %r13
00000000001697cc	cmpq	$-0x9, %r13
00000000001697d0	jae	0x16a70c
00000000001697d6	cmpq	$0x17, %r13
00000000001697da	jae	0x169987
00000000001697e0	xorps	%xmm0, %xmm0
00000000001697e3	movaps	%xmm0, -0x50(%rbp)
00000000001697e7	movq	$0x0, -0x40(%rbp)
00000000001697ef	addb	%r13b, %r13b
00000000001697f2	movb	%r13b, -0x50(%rbp)
00000000001697f6	leaq	-0x4f(%rbp), %r14
00000000001697fa	testq	%r12, %r12
00000000001697fd	jne	0x1699c8
0000000000169803	jmp	0x1699d3
0000000000169808	leaq	0x9(%r15), %rsi
000000000016980c	shrl	%r12d
000000000016980f	leaq	0x1(%r12), %r13
0000000000169814	cmpq	$-0x9, %r13
0000000000169818	jae	0x16a6fe
000000000016981e	cmpq	$0x17, %r13
0000000000169822	jae	0x169a28
0000000000169828	xorps	%xmm0, %xmm0
000000000016982b	movaps	%xmm0, -0x50(%rbp)
000000000016982f	movq	$0x0, -0x40(%rbp)
0000000000169837	addb	%r13b, %r13b
000000000016983a	movb	%r13b, -0x50(%rbp)
000000000016983e	leaq	-0x4f(%rbp), %r14
0000000000169842	testq	%r12, %r12
0000000000169845	jne	0x169a69
000000000016984b	jmp	0x169a74
0000000000169850	leaq	0x9(%r15), %rsi
0000000000169854	shrl	%r12d
0000000000169857	leaq	0x8(%r12), %r13
000000000016985c	cmpq	$-0x9, %r13
0000000000169860	jae	0x16a713
0000000000169866	cmpq	$0x17, %r13
000000000016986a	jae	0x169ac9
0000000000169870	xorps	%xmm0, %xmm0
0000000000169873	movaps	%xmm0, -0x50(%rbp)
0000000000169877	movq	$0x0, -0x40(%rbp)
000000000016987f	addb	%r13b, %r13b
0000000000169882	movb	%r13b, -0x50(%rbp)
0000000000169886	leaq	-0x4f(%rbp), %r14
000000000016988a	testq	%r12, %r12
000000000016988d	jne	0x169b11
0000000000169893	jmp	0x169b1c
0000000000169898	leaq	0x9(%r15), %rsi
000000000016989c	shrl	%edx
000000000016989e	leaq	-0xd0(%rbp), %rdi
00000000001698a5	callq	0x3c4e3e                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcm
00000000001698aa	movl	0x24(%r15), %eax
00000000001698ae	decl	%eax
00000000001698b0	cmpl	$0x3, %eax
00000000001698b3	ja	0x1698ce
00000000001698b5	movl	%eax, %eax
00000000001698b7	leaq	0x8b76f2(%rip), %rcx
00000000001698be	movq	(%rcx,%rax,8), %rsi
00000000001698c2	leaq	-0xd0(%rbp), %rdi
00000000001698c9	callq	0x3c4e38                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc
00000000001698ce	leaq	-0xd0(%rbp), %rdi
00000000001698d5	leaq	0x78183b(%rip), %rsi            ## literal pool for: "shaderParams [[ buffer(0) ]]"
00000000001698dc	callq	0x3c4e38                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc
00000000001698e1	jmp	0x169eb0
00000000001698e6	movq	%rsi, -0xf8(%rbp)
00000000001698ed	movq	%r13, %rax
00000000001698f0	orq	$0x7, %rax
00000000001698f4	leaq	0x1(%rax), %rbx
00000000001698f8	cmpq	$0x17, %rax
00000000001698fc	movl	$0x1a, %eax
0000000000169901	cmoveq	%rax, %rbx
0000000000169905	movq	%rbx, %rdi
0000000000169908	callq	0x3c4fb2                        ## symbol stub for: __Znwm
000000000016990d	movq	%rax, %r14
0000000000169910	orq	$0x1, %rbx
0000000000169914	movq	%rbx, -0x50(%rbp)
0000000000169918	movq	%rax, -0x40(%rbp)
000000000016991c	movq	%r13, -0x48(%rbp)
0000000000169920	leaq	-0x90(%rbp), %rbx
0000000000169927	movq	-0xf8(%rbp), %rsi
000000000016992e	movq	%r14, %rdi
0000000000169931	movq	%r12, %rdx
0000000000169934	callq	0x3c5438                        ## symbol stub for: _memcpy
0000000000169939	movabsq	$0x72656c706d617320, %rax       ## imm = 0x72656C706D617320
0000000000169943	movq	%rax, (%r14,%r12)
0000000000169947	movb	$0x0, 0x8(%r14,%r12)
000000000016994d	movzbl	-0x180(%rbp), %r12d
0000000000169955	movq	%rbx, %rdi
0000000000169958	movl	%r12d, %esi
000000000016995b	callq	0x3c4f70                        ## symbol stub for: __ZNSt3__19to_stringEi
0000000000169960	leaq	-0xaf(%rbp), %r13
0000000000169967	movzbl	-0x90(%rbp), %edx
000000000016996e	testb	$0x1, %dl
0000000000169971	je	0x169b6a
0000000000169977	movq	-0x80(%rbp), %rsi
000000000016997b	movq	-0x88(%rbp), %rdx
0000000000169982	jmp	0x169b73
0000000000169987	movq	%rsi, -0xf8(%rbp)
000000000016998e	movq	%r13, %rax
0000000000169991	orq	$0x7, %rax
0000000000169995	leaq	0x1(%rax), %rbx
0000000000169999	cmpq	$0x17, %rax
000000000016999d	movl	$0x1a, %eax
00000000001699a2	cmoveq	%rax, %rbx
00000000001699a6	movq	%rbx, %rdi
00000000001699a9	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000001699ae	movq	%rax, %r14
00000000001699b1	orq	$0x1, %rbx
00000000001699b5	movq	%rbx, -0x50(%rbp)
00000000001699b9	movq	%rax, -0x40(%rbp)
00000000001699bd	movq	%r13, -0x48(%rbp)
00000000001699c1	movq	-0xf8(%rbp), %rsi
00000000001699c8	movq	%r14, %rdi
00000000001699cb	movq	%r12, %rdx
00000000001699ce	callq	0x3c5438                        ## symbol stub for: _memcpy
00000000001699d3	movw	$0x20, (%r14,%r12)
00000000001699da	leaq	-0x50(%rbp), %rdi
00000000001699de	leaq	0x781715(%rip), %rsi            ## literal pool for: "position [[ position ]]"
00000000001699e5	callq	0x3c4e38                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc
00000000001699ea	leaq	-0xaf(%rbp), %r13
00000000001699f1	movq	0x10(%rax), %rcx
00000000001699f5	movq	%rcx, -0x60(%rbp)
00000000001699f9	movups	(%rax), %xmm0
00000000001699fc	movaps	%xmm0, -0x70(%rbp)
0000000000169a00	xorps	%xmm0, %xmm0
0000000000169a03	movups	%xmm0, (%rax)
0000000000169a06	movq	$0x0, 0x10(%rax)
0000000000169a0e	movzbl	-0x70(%rbp), %edx
0000000000169a12	testb	$0x1, %dl
0000000000169a15	je	0x169bb3
0000000000169a1b	movq	-0x60(%rbp), %rsi
0000000000169a1f	movq	-0x68(%rbp), %rdx
0000000000169a23	jmp	0x169bb9
0000000000169a28	movq	%rsi, -0xf8(%rbp)
0000000000169a2f	movq	%r13, %rax
0000000000169a32	orq	$0x7, %rax
0000000000169a36	leaq	0x1(%rax), %rbx
0000000000169a3a	cmpq	$0x17, %rax
0000000000169a3e	movl	$0x1a, %eax
0000000000169a43	cmoveq	%rax, %rbx
0000000000169a47	movq	%rbx, %rdi
0000000000169a4a	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000169a4f	movq	%rax, %r14
0000000000169a52	orq	$0x1, %rbx
0000000000169a56	movq	%rbx, -0x50(%rbp)
0000000000169a5a	movq	%rax, -0x40(%rbp)
0000000000169a5e	movq	%r13, -0x48(%rbp)
0000000000169a62	movq	-0xf8(%rbp), %rsi
0000000000169a69	movq	%r14, %rdi
0000000000169a6c	movq	%r12, %rdx
0000000000169a6f	callq	0x3c5438                        ## symbol stub for: _memcpy
0000000000169a74	movw	$0x20, (%r14,%r12)
0000000000169a7b	leaq	-0x50(%rbp), %rdi
0000000000169a7f	leaq	0x78165f(%rip), %rsi            ## literal pool for: "vdata [[ stage_in ]]"
0000000000169a86	callq	0x3c4e38                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc
0000000000169a8b	leaq	-0xaf(%rbp), %r13
0000000000169a92	movq	0x10(%rax), %rcx
0000000000169a96	movq	%rcx, -0x60(%rbp)
0000000000169a9a	movups	(%rax), %xmm0
0000000000169a9d	movaps	%xmm0, -0x70(%rbp)
0000000000169aa1	xorps	%xmm0, %xmm0
0000000000169aa4	movups	%xmm0, (%rax)
0000000000169aa7	movq	$0x0, 0x10(%rax)
0000000000169aaf	movzbl	-0x70(%rbp), %edx
0000000000169ab3	testb	$0x1, %dl
0000000000169ab6	je	0x169bc7
0000000000169abc	movq	-0x60(%rbp), %rsi
0000000000169ac0	movq	-0x68(%rbp), %rdx
0000000000169ac4	jmp	0x169bcd
0000000000169ac9	movq	%rsi, -0xf8(%rbp)
0000000000169ad0	movq	%r13, %rax
0000000000169ad3	orq	$0x7, %rax
0000000000169ad7	leaq	0x1(%rax), %rbx
0000000000169adb	cmpq	$0x17, %rax
0000000000169adf	movl	$0x1a, %eax
0000000000169ae4	cmoveq	%rax, %rbx
0000000000169ae8	movq	%rbx, %rdi
0000000000169aeb	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000169af0	movq	%rax, %r14
0000000000169af3	orq	$0x1, %rbx
0000000000169af7	movq	%rbx, -0x50(%rbp)
0000000000169afb	movq	%rax, -0x40(%rbp)
0000000000169aff	movq	%r13, -0x48(%rbp)
0000000000169b03	leaq	-0x90(%rbp), %rbx
0000000000169b0a	movq	-0xf8(%rbp), %rsi
0000000000169b11	movq	%r14, %rdi
0000000000169b14	movq	%r12, %rdx
0000000000169b17	callq	0x3c5438                        ## symbol stub for: _memcpy
0000000000169b1c	movabsq	$0x6572757478657420, %rax       ## imm = 0x6572757478657420
0000000000169b26	movq	%rax, (%r14,%r12)
0000000000169b2a	movb	$0x0, 0x8(%r14,%r12)
0000000000169b30	movzbl	-0x178(%rbp), %r12d
0000000000169b38	movq	%rbx, %rdi
0000000000169b3b	movl	%r12d, %esi
0000000000169b3e	callq	0x3c4f70                        ## symbol stub for: __ZNSt3__19to_stringEi
0000000000169b43	leaq	-0xaf(%rbp), %r13
0000000000169b4a	movzbl	-0x90(%rbp), %edx
0000000000169b51	testb	$0x1, %dl
0000000000169b54	je	0x169c00
0000000000169b5a	movq	-0x80(%rbp), %rsi
0000000000169b5e	movq	-0x88(%rbp), %rdx
0000000000169b65	jmp	0x169c09
0000000000169b6a	shrl	%edx
0000000000169b6c	leaq	-0x8f(%rbp), %rsi
0000000000169b73	leaq	-0x50(%rbp), %rdi
0000000000169b77	callq	0x3c4e3e                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcm
0000000000169b7c	movq	0x10(%rax), %rcx
0000000000169b80	movq	%rcx, -0x60(%rbp)
0000000000169b84	movups	(%rax), %xmm0
0000000000169b87	movaps	%xmm0, -0x70(%rbp)
0000000000169b8b	xorps	%xmm0, %xmm0
0000000000169b8e	movups	%xmm0, (%rax)
0000000000169b91	movq	$0x0, 0x10(%rax)
0000000000169b99	movzbl	-0x70(%rbp), %edx
0000000000169b9d	testb	$0x1, %dl
0000000000169ba0	je	0x169c49
0000000000169ba6	movq	-0x60(%rbp), %rsi
0000000000169baa	movq	-0x68(%rbp), %rdx
0000000000169bae	jmp	0x169c4f
0000000000169bb3	shrl	%edx
0000000000169bb5	leaq	-0x6f(%rbp), %rsi
0000000000169bb9	leaq	-0xd0(%rbp), %rdi
0000000000169bc0	callq	0x3c4e3e                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcm
0000000000169bc5	jmp	0x169bd9
0000000000169bc7	shrl	%edx
0000000000169bc9	leaq	-0x6f(%rbp), %rsi
0000000000169bcd	leaq	-0xd0(%rbp), %rdi
0000000000169bd4	callq	0x3c4e3e                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcm
0000000000169bd9	testb	$0x1, -0x70(%rbp)
0000000000169bdd	je	0x169be8
0000000000169bdf	movq	-0x60(%rbp), %rdi
0000000000169be3	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000169be8	testb	$0x1, -0x50(%rbp)
0000000000169bec	je	0x169eb0
0000000000169bf2	movq	-0x40(%rbp), %rdi
0000000000169bf6	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000169bfb	jmp	0x169eb0
0000000000169c00	shrl	%edx
0000000000169c02	leaq	-0x8f(%rbp), %rsi
0000000000169c09	leaq	-0x50(%rbp), %rdi
0000000000169c0d	callq	0x3c4e3e                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcm
0000000000169c12	movq	0x10(%rax), %rcx
0000000000169c16	movq	%rcx, -0x60(%rbp)
0000000000169c1a	movups	(%rax), %xmm0
0000000000169c1d	movaps	%xmm0, -0x70(%rbp)
0000000000169c21	xorps	%xmm0, %xmm0
0000000000169c24	movups	%xmm0, (%rax)
0000000000169c27	movq	$0x0, 0x10(%rax)
0000000000169c2f	movzbl	-0x70(%rbp), %edx
0000000000169c33	testb	$0x1, %dl
0000000000169c36	je	0x169d01
0000000000169c3c	movq	-0x60(%rbp), %rsi
0000000000169c40	movq	-0x68(%rbp), %rdx
0000000000169c44	jmp	0x169d07
0000000000169c49	shrl	%edx
0000000000169c4b	leaq	-0x6f(%rbp), %rsi
0000000000169c4f	leaq	-0xd0(%rbp), %rdi
0000000000169c56	callq	0x3c4e3e                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcm
0000000000169c5b	testb	$0x1, -0x70(%rbp)
0000000000169c5f	jne	0x169db9
0000000000169c65	testb	$0x1, -0x90(%rbp)
0000000000169c6c	jne	0x169dcf
0000000000169c72	testb	$0x1, -0x50(%rbp)
0000000000169c76	je	0x169c81
0000000000169c78	movq	-0x40(%rbp), %rdi
0000000000169c7c	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000169c81	movq	%rbx, %rdi
0000000000169c84	movl	%r12d, %esi
0000000000169c87	callq	0x3c4f70                        ## symbol stub for: __ZNSt3__19to_stringEi
0000000000169c8c	movq	%rbx, %rdi
0000000000169c8f	xorl	%esi, %esi
0000000000169c91	leaq	0x77b574(%rip), %rdx            ## literal pool for: " [[ sampler("
0000000000169c98	callq	0x3c4e4a                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6insertEmPKc
0000000000169c9d	movq	0x10(%rax), %rcx
0000000000169ca1	movq	%rcx, -0x40(%rbp)
0000000000169ca5	movups	(%rax), %xmm0
0000000000169ca8	movaps	%xmm0, -0x50(%rbp)
0000000000169cac	xorps	%xmm0, %xmm0
0000000000169caf	movups	%xmm0, (%rax)
0000000000169cb2	movq	$0x0, 0x10(%rax)
0000000000169cba	leaq	-0x50(%rbp), %rdi
0000000000169cbe	leaq	0x78144d(%rip), %rsi            ## literal pool for: ") ]]"
0000000000169cc5	callq	0x3c4e38                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc
0000000000169cca	movq	0x10(%rax), %rcx
0000000000169cce	movq	%rcx, -0x60(%rbp)
0000000000169cd2	movups	(%rax), %xmm0
0000000000169cd5	movaps	%xmm0, -0x70(%rbp)
0000000000169cd9	xorps	%xmm0, %xmm0
0000000000169cdc	movups	%xmm0, (%rax)
0000000000169cdf	movq	$0x0, 0x10(%rax)
0000000000169ce7	movzbl	-0x70(%rbp), %edx
0000000000169ceb	testb	$0x1, %dl
0000000000169cee	je	0x169e15
0000000000169cf4	movq	-0x60(%rbp), %rsi
0000000000169cf8	movq	-0x68(%rbp), %rdx
0000000000169cfc	jmp	0x169e1b
0000000000169d01	shrl	%edx
0000000000169d03	leaq	-0x6f(%rbp), %rsi
0000000000169d07	leaq	-0xd0(%rbp), %rdi
0000000000169d0e	callq	0x3c4e3e                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcm
0000000000169d13	testb	$0x1, -0x70(%rbp)
0000000000169d17	jne	0x169de7
0000000000169d1d	testb	$0x1, -0x90(%rbp)
0000000000169d24	jne	0x169dfd
0000000000169d2a	testb	$0x1, -0x50(%rbp)
0000000000169d2e	je	0x169d39
0000000000169d30	movq	-0x40(%rbp), %rdi
0000000000169d34	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000169d39	movq	%rbx, %rdi
0000000000169d3c	movl	%r12d, %esi
0000000000169d3f	callq	0x3c4f70                        ## symbol stub for: __ZNSt3__19to_stringEi
0000000000169d44	movq	%rbx, %rdi
0000000000169d47	xorl	%esi, %esi
0000000000169d49	leaq	0x77b49c(%rip), %rdx            ## literal pool for: " [[ texture("
0000000000169d50	callq	0x3c4e4a                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6insertEmPKc
0000000000169d55	movq	0x10(%rax), %rcx
0000000000169d59	movq	%rcx, -0x40(%rbp)
0000000000169d5d	movups	(%rax), %xmm0
0000000000169d60	movaps	%xmm0, -0x50(%rbp)
0000000000169d64	xorps	%xmm0, %xmm0
0000000000169d67	movups	%xmm0, (%rax)
0000000000169d6a	movq	$0x0, 0x10(%rax)
0000000000169d72	leaq	-0x50(%rbp), %rdi
0000000000169d76	leaq	0x781395(%rip), %rsi            ## literal pool for: ") ]]"
0000000000169d7d	callq	0x3c4e38                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc
0000000000169d82	movq	0x10(%rax), %rcx
0000000000169d86	movq	%rcx, -0x60(%rbp)
0000000000169d8a	movups	(%rax), %xmm0
0000000000169d8d	movaps	%xmm0, -0x70(%rbp)
0000000000169d91	xorps	%xmm0, %xmm0
0000000000169d94	movups	%xmm0, (%rax)
0000000000169d97	movq	$0x0, 0x10(%rax)
0000000000169d9f	movzbl	-0x70(%rbp), %edx
0000000000169da3	testb	$0x1, %dl
0000000000169da6	je	0x169e5f
0000000000169dac	movq	-0x60(%rbp), %rsi
0000000000169db0	movq	-0x68(%rbp), %rdx
0000000000169db4	jmp	0x169e65
0000000000169db9	movq	-0x60(%rbp), %rdi
0000000000169dbd	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000169dc2	testb	$0x1, -0x90(%rbp)
0000000000169dc9	je	0x169c72
0000000000169dcf	movq	-0x80(%rbp), %rdi
0000000000169dd3	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000169dd8	testb	$0x1, -0x50(%rbp)
0000000000169ddc	jne	0x169c78
0000000000169de2	jmp	0x169c81
0000000000169de7	movq	-0x60(%rbp), %rdi
0000000000169deb	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000169df0	testb	$0x1, -0x90(%rbp)
0000000000169df7	je	0x169d2a
0000000000169dfd	movq	-0x80(%rbp), %rdi
0000000000169e01	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000169e06	testb	$0x1, -0x50(%rbp)
0000000000169e0a	jne	0x169d30
0000000000169e10	jmp	0x169d39
0000000000169e15	shrl	%edx
0000000000169e17	leaq	-0x6f(%rbp), %rsi
0000000000169e1b	leaq	-0xd0(%rbp), %rdi
0000000000169e22	callq	0x3c4e3e                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcm
0000000000169e27	testb	$0x1, -0x70(%rbp)
0000000000169e2b	jne	0x169f4c
0000000000169e31	testb	$0x1, -0x50(%rbp)
0000000000169e35	jne	0x169f5f
0000000000169e3b	testb	$0x1, -0x90(%rbp)
0000000000169e42	je	0x169e4d
0000000000169e44	movq	-0x80(%rbp), %rdi
0000000000169e48	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000169e4d	movq	-0x180(%rbp), %rax
0000000000169e54	incb	%al
0000000000169e56	movq	%rax, -0x180(%rbp)
0000000000169e5d	jmp	0x169eb0
0000000000169e5f	shrl	%edx
0000000000169e61	leaq	-0x6f(%rbp), %rsi
0000000000169e65	leaq	-0xd0(%rbp), %rdi
0000000000169e6c	callq	0x3c4e3e                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcm
0000000000169e71	testb	$0x1, -0x70(%rbp)
0000000000169e75	jne	0x169f7a
0000000000169e7b	testb	$0x1, -0x50(%rbp)
0000000000169e7f	jne	0x169f8d
0000000000169e85	testb	$0x1, -0x90(%rbp)
0000000000169e8c	je	0x169e97
0000000000169e8e	movq	-0x80(%rbp), %rdi
0000000000169e92	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000169e97	movq	-0x178(%rbp), %rax
0000000000169e9e	incb	%al
0000000000169ea0	movq	%rax, -0x178(%rbp)
0000000000169ea7	nopw	(%rax,%rax)
0000000000169eb0	movb	$0x8, -0x70(%rbp)
0000000000169eb4	movl	$0x20202020, -0x6f(%rbp)        ## imm = 0x20202020
0000000000169ebb	movb	$0x0, -0x6b(%rbp)
0000000000169ebf	leaq	-0x70(%rbp), %rdi
0000000000169ec3	xorl	%esi, %esi
0000000000169ec5	leaq	0x781268(%rip), %rdx            ## literal pool for: ",\n"
0000000000169ecc	callq	0x3c4e4a                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6insertEmPKc
0000000000169ed1	movzbl	(%rax), %ebx
0000000000169ed4	movzbl	0x1(%rax), %r14d
0000000000169ed9	movq	0x8(%rax), %rcx
0000000000169edd	movq	%rcx, -0x4a(%rbp)
0000000000169ee1	movq	0x2(%rax), %rcx
0000000000169ee5	movq	%rcx, -0x50(%rbp)
0000000000169ee9	movq	0x10(%rax), %r12
0000000000169eed	xorps	%xmm0, %xmm0
0000000000169ef0	movups	%xmm0, (%rax)
0000000000169ef3	movq	$0x0, 0x10(%rax)
0000000000169efb	testb	$0x1, -0xb0(%rbp)
0000000000169f02	je	0x169f10
0000000000169f04	movq	-0xa0(%rbp), %rdi
0000000000169f0b	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000169f10	movb	%bl, -0xb0(%rbp)
0000000000169f16	movb	%r14b, -0xaf(%rbp)
0000000000169f1d	movq	-0x50(%rbp), %rax
0000000000169f21	movq	-0x4a(%rbp), %rcx
0000000000169f25	movq	%rcx, 0x7(%r13)
0000000000169f29	movq	%rax, 0x1(%r13)
0000000000169f2d	movq	%r12, -0xa0(%rbp)
0000000000169f34	testb	$0x1, -0x70(%rbp)
0000000000169f38	je	0x169660
0000000000169f3e	movq	-0x60(%rbp), %rdi
0000000000169f42	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000169f47	jmp	0x169660
0000000000169f4c	movq	-0x60(%rbp), %rdi
0000000000169f50	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000169f55	testb	$0x1, -0x50(%rbp)
0000000000169f59	je	0x169e3b
0000000000169f5f	movq	-0x40(%rbp), %rdi
0000000000169f63	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000169f68	testb	$0x1, -0x90(%rbp)
0000000000169f6f	jne	0x169e44
0000000000169f75	jmp	0x169e4d
0000000000169f7a	movq	-0x60(%rbp), %rdi
0000000000169f7e	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000169f83	testb	$0x1, -0x50(%rbp)
0000000000169f87	je	0x169e85
0000000000169f8d	movq	-0x40(%rbp), %rdi
0000000000169f91	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000169f96	testb	$0x1, -0x90(%rbp)
0000000000169f9d	jne	0x169e8e
0000000000169fa3	jmp	0x169e97
0000000000169fa8	leaq	0x771d86(%rip), %rsi            ## literal pool for: ")\n"
0000000000169faf	leaq	-0xd0(%rbp), %rdi
0000000000169fb6	callq	0x3c4e38                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc
0000000000169fbb	xorps	%xmm0, %xmm0
0000000000169fbe	movaps	%xmm0, -0x70(%rbp)
0000000000169fc2	movq	$0x0, -0x60(%rbp)
0000000000169fca	leaq	-0x70(%rbp), %rdi
0000000000169fce	movl	$0x400, %esi                    ## imm = 0x400
0000000000169fd3	callq	0x3c4e56                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEm
0000000000169fd8	leaq	0x781158(%rip), %rsi            ## literal pool for: "struct VertexData {\n"
0000000000169fdf	leaq	-0x70(%rbp), %rdi
0000000000169fe3	callq	0x3c4e38                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc
0000000000169fe8	movb	$0x8, -0x90(%rbp)
0000000000169fef	movl	$0x20202020, -0x8f(%rbp)        ## imm = 0x20202020
0000000000169ff9	movb	$0x0, -0x8b(%rbp)
000000000016a000	leaq	0x781145(%rip), %rsi            ## literal pool for: "float4 _position [[ position ]];\n"
000000000016a007	leaq	-0x90(%rbp), %rdi
000000000016a00e	callq	0x3c4e38                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc
000000000016a013	movq	0x10(%rax), %rcx
000000000016a017	movq	%rcx, -0x40(%rbp)
000000000016a01b	movups	(%rax), %xmm0
000000000016a01e	movaps	%xmm0, -0x50(%rbp)
000000000016a022	xorps	%xmm0, %xmm0
000000000016a025	movups	%xmm0, (%rax)
000000000016a028	movq	$0x0, 0x10(%rax)
000000000016a030	movzbl	-0x50(%rbp), %edx
000000000016a034	testb	$0x1, %dl
000000000016a037	je	0x16a043
000000000016a039	movq	-0x40(%rbp), %rsi
000000000016a03d	movq	-0x48(%rbp), %rdx
000000000016a041	jmp	0x16a049
000000000016a043	shrl	%edx
000000000016a045	leaq	-0x4f(%rbp), %rsi
000000000016a049	leaq	-0x70(%rbp), %rdi
000000000016a04d	callq	0x3c4e3e                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcm
000000000016a052	testb	$0x1, -0x50(%rbp)
000000000016a056	jne	0x16a072
000000000016a058	testb	$0x1, -0x90(%rbp)
000000000016a05f	jne	0x16a084
000000000016a061	movq	-0x1c8(%rbp), %r12
000000000016a068	testq	%r12, %r12
000000000016a06b	jne	0x16a09d
000000000016a06d	jmp	0x16a319
000000000016a072	movq	-0x40(%rbp), %rdi
000000000016a076	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016a07b	testb	$0x1, -0x90(%rbp)
000000000016a082	je	0x16a061
000000000016a084	movq	-0x80(%rbp), %rdi
000000000016a088	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016a08d	movq	-0x1c8(%rbp), %r12
000000000016a094	testq	%r12, %r12
000000000016a097	je	0x16a319
000000000016a09d	xorl	%ebx, %ebx
000000000016a09f	leaq	-0x198(%rbp), %r15
000000000016a0a6	leaq	-0x90(%rbp), %r13
000000000016a0ad	leaq	-0x70(%rbp), %r14
000000000016a0b1	jmp	0x16a0cc
000000000016a0b3	nopw	%cs:(%rax,%rax)
000000000016a0c0	incq	%rbx
000000000016a0c3	cmpq	%rbx, %r12
000000000016a0c6	je	0x16a319
000000000016a0cc	movb	$0x8, -0x198(%rbp)
000000000016a0d3	movl	$0x20202020, -0x197(%rbp)       ## imm = 0x20202020
000000000016a0dd	movb	$0x0, -0x193(%rbp)
000000000016a0e4	movq	%r15, %rdi
000000000016a0e7	leaq	0x781080(%rip), %rsi            ## literal pool for: "float4 _texcoord"
000000000016a0ee	callq	0x3c4e38                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc
000000000016a0f3	movq	0x10(%rax), %rcx
000000000016a0f7	movq	%rcx, -0x80(%rbp)
000000000016a0fb	movups	(%rax), %xmm0
000000000016a0fe	movaps	%xmm0, -0x90(%rbp)
000000000016a105	xorps	%xmm0, %xmm0
000000000016a108	movups	%xmm0, (%rax)
000000000016a10b	movq	$0x0, 0x10(%rax)
000000000016a113	leaq	-0x1c0(%rbp), %rdi
000000000016a11a	movl	%ebx, %esi
000000000016a11c	callq	0x3c4f70                        ## symbol stub for: __ZNSt3__19to_stringEi
000000000016a121	movzbl	-0x1c0(%rbp), %edx
000000000016a128	testb	$0x1, %dl
000000000016a12b	je	0x16a140
000000000016a12d	movq	-0x1b0(%rbp), %rsi
000000000016a134	movq	-0x1b8(%rbp), %rdx
000000000016a13b	jmp	0x16a149
000000000016a13d	nopl	(%rax)
000000000016a140	shrl	%edx
000000000016a142	leaq	-0x1bf(%rbp), %rsi
000000000016a149	movq	%r13, %rdi
000000000016a14c	callq	0x3c4e3e                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcm
000000000016a151	movq	0x10(%rax), %rcx
000000000016a155	movq	%rcx, -0x40(%rbp)
000000000016a159	movups	(%rax), %xmm0
000000000016a15c	movaps	%xmm0, -0x50(%rbp)
000000000016a160	xorps	%xmm0, %xmm0
000000000016a163	movups	%xmm0, (%rax)
000000000016a166	movq	$0x0, 0x10(%rax)
000000000016a16e	movzbl	-0x50(%rbp), %edx
000000000016a172	testb	$0x1, %dl
000000000016a175	je	0x16a190
000000000016a177	movq	-0x40(%rbp), %rsi
000000000016a17b	movq	-0x48(%rbp), %rdx
000000000016a17f	jmp	0x16a196
000000000016a181	nopw	%cs:(%rax,%rax)
000000000016a190	shrl	%edx
000000000016a192	leaq	-0x4f(%rbp), %rsi
000000000016a196	movq	%r14, %rdi
000000000016a199	callq	0x3c4e3e                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcm
000000000016a19e	testb	$0x1, -0x50(%rbp)
000000000016a1a2	jne	0x16a260
000000000016a1a8	testb	$0x1, -0x1c0(%rbp)
000000000016a1af	jne	0x16a276
000000000016a1b5	testb	$0x1, -0x90(%rbp)
000000000016a1bc	jne	0x16a28f
000000000016a1c2	testb	$0x1, -0x198(%rbp)
000000000016a1c9	je	0x16a1d7
000000000016a1cb	movq	-0x188(%rbp), %rdi
000000000016a1d2	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016a1d7	movq	%r15, %rdi
000000000016a1da	movl	%ebx, %esi
000000000016a1dc	callq	0x3c4f70                        ## symbol stub for: __ZNSt3__19to_stringEi
000000000016a1e1	movq	%r15, %rdi
000000000016a1e4	xorl	%esi, %esi
000000000016a1e6	leaq	0x78c88b(%rip), %rdx            ## literal pool for: " [[ user(texcoord"
000000000016a1ed	callq	0x3c4e4a                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6insertEmPKc
000000000016a1f2	movq	0x10(%rax), %rcx
000000000016a1f6	movq	%rcx, -0x80(%rbp)
000000000016a1fa	movups	(%rax), %xmm0
000000000016a1fd	movaps	%xmm0, -0x90(%rbp)
000000000016a204	xorps	%xmm0, %xmm0
000000000016a207	movups	%xmm0, (%rax)
000000000016a20a	movq	$0x0, 0x10(%rax)
000000000016a212	movq	%r13, %rdi
000000000016a215	leaq	0x780f63(%rip), %rsi            ## literal pool for: ") ]];\n"
000000000016a21c	callq	0x3c4e38                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc
000000000016a221	movq	0x10(%rax), %rcx
000000000016a225	movq	%rcx, -0x40(%rbp)
000000000016a229	movups	(%rax), %xmm0
000000000016a22c	movaps	%xmm0, -0x50(%rbp)
000000000016a230	xorps	%xmm0, %xmm0
000000000016a233	movups	%xmm0, (%rax)
000000000016a236	movq	$0x0, 0x10(%rax)
000000000016a23e	movzbl	-0x50(%rbp), %edx
000000000016a242	testb	$0x1, %dl
000000000016a245	je	0x16a2b0
000000000016a247	movq	-0x40(%rbp), %rsi
000000000016a24b	movq	-0x48(%rbp), %rdx
000000000016a24f	jmp	0x16a2b6
000000000016a251	nopw	%cs:(%rax,%rax)
000000000016a260	movq	-0x40(%rbp), %rdi
000000000016a264	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016a269	testb	$0x1, -0x1c0(%rbp)
000000000016a270	je	0x16a1b5
000000000016a276	movq	-0x1b0(%rbp), %rdi
000000000016a27d	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016a282	testb	$0x1, -0x90(%rbp)
000000000016a289	je	0x16a1c2
000000000016a28f	movq	-0x80(%rbp), %rdi
000000000016a293	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016a298	testb	$0x1, -0x198(%rbp)
000000000016a29f	jne	0x16a1cb
000000000016a2a5	jmp	0x16a1d7
000000000016a2aa	nopw	(%rax,%rax)
000000000016a2b0	shrl	%edx
000000000016a2b2	leaq	-0x4f(%rbp), %rsi
000000000016a2b6	movq	%r14, %rdi
000000000016a2b9	callq	0x3c4e3e                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcm
000000000016a2be	testb	$0x1, -0x50(%rbp)
000000000016a2c2	jne	0x16a2e0
000000000016a2c4	testb	$0x1, -0x90(%rbp)
000000000016a2cb	jne	0x16a2f2
000000000016a2cd	testb	$0x1, -0x198(%rbp)
000000000016a2d4	je	0x16a0c0
000000000016a2da	jmp	0x16a308
000000000016a2dc	nopl	(%rax)
000000000016a2e0	movq	-0x40(%rbp), %rdi
000000000016a2e4	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016a2e9	testb	$0x1, -0x90(%rbp)
000000000016a2f0	je	0x16a2cd
000000000016a2f2	movq	-0x80(%rbp), %rdi
000000000016a2f6	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016a2fb	testb	$0x1, -0x198(%rbp)
000000000016a302	je	0x16a0c0
000000000016a308	movq	-0x188(%rbp), %rdi
000000000016a30f	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016a314	jmp	0x16a0c0
000000000016a319	cmpb	$0x0, -0x71(%rbp)
000000000016a31d	je	0x16a3ae
000000000016a323	movb	$0x8, -0x90(%rbp)
000000000016a32a	movl	$0x20202020, -0x8f(%rbp)        ## imm = 0x20202020
000000000016a334	movb	$0x0, -0x8b(%rbp)
000000000016a33b	leaq	0x780e44(%rip), %rsi            ## literal pool for: "float4 _color [[ user(primary) ]];\n"
000000000016a342	leaq	-0x90(%rbp), %rdi
000000000016a349	callq	0x3c4e38                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc
000000000016a34e	movq	0x10(%rax), %rcx
000000000016a352	movq	%rcx, -0x40(%rbp)
000000000016a356	movups	(%rax), %xmm0
000000000016a359	movaps	%xmm0, -0x50(%rbp)
000000000016a35d	xorps	%xmm0, %xmm0
000000000016a360	movups	%xmm0, (%rax)
000000000016a363	movq	$0x0, 0x10(%rax)
000000000016a36b	movzbl	-0x50(%rbp), %edx
000000000016a36f	testb	$0x1, %dl
000000000016a372	je	0x16a37e
000000000016a374	movq	-0x40(%rbp), %rsi
000000000016a378	movq	-0x48(%rbp), %rdx
000000000016a37c	jmp	0x16a384
000000000016a37e	shrl	%edx
000000000016a380	leaq	-0x4f(%rbp), %rsi
000000000016a384	leaq	-0x70(%rbp), %rdi
000000000016a388	callq	0x3c4e3e                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcm
000000000016a38d	testb	$0x1, -0x50(%rbp)
000000000016a391	je	0x16a39c
000000000016a393	movq	-0x40(%rbp), %rdi
000000000016a397	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016a39c	testb	$0x1, -0x90(%rbp)
000000000016a3a3	je	0x16a3ae
000000000016a3a5	movq	-0x80(%rbp), %rdi
000000000016a3a9	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016a3ae	leaq	0x780cdd(%rip), %rsi            ## literal pool for: "};\n"
000000000016a3b5	leaq	-0x70(%rbp), %rdi
000000000016a3b9	callq	0x3c4e38                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc
000000000016a3be	movzbl	-0x70(%rbp), %ebx
000000000016a3c2	testb	$0x1, %bl
000000000016a3c5	je	0x16a3e9
000000000016a3c7	movq	-0x60(%rbp), %r12
000000000016a3cb	movq	-0x68(%rbp), %rbx
000000000016a3cf	movzbl	-0xd0(%rbp), %r14d
000000000016a3d7	testb	$0x1, %r14b
000000000016a3db	jne	0x16a3fd
000000000016a3dd	shrl	%r14d
000000000016a3e0	leaq	-0xcf(%rbp), %r15
000000000016a3e7	jmp	0x16a40b
000000000016a3e9	shrl	%ebx
000000000016a3eb	leaq	-0x6f(%rbp), %r12
000000000016a3ef	movzbl	-0xd0(%rbp), %r14d
000000000016a3f7	testb	$0x1, %r14b
000000000016a3fb	je	0x16a3dd
000000000016a3fd	movq	-0xc0(%rbp), %r15
000000000016a404	movq	-0xc8(%rbp), %r14
000000000016a40b	leaq	(%r14,%rbx), %r13
000000000016a40f	cmpq	$-0x9, %r13
000000000016a413	jae	0x16a726
000000000016a419	cmpq	$0x16, %r13
000000000016a41d	ja	0x16a43f
000000000016a41f	xorps	%xmm0, %xmm0
000000000016a422	movaps	%xmm0, -0x90(%rbp)
000000000016a429	movq	$0x0, -0x80(%rbp)
000000000016a431	addb	%r13b, %r13b
000000000016a434	movb	%r13b, -0x90(%rbp)
000000000016a43b	xorl	%eax, %eax
000000000016a43d	jmp	0x16a487
000000000016a43f	movq	%r15, -0x100(%rbp)
000000000016a446	movq	%r13, %rax
000000000016a449	orq	$0x7, %rax
000000000016a44d	leaq	0x1(%rax), %rcx
000000000016a451	cmpq	$0x17, %rax
000000000016a455	movl	$0x1a, %r15d
000000000016a45b	cmovneq	%rcx, %r15
000000000016a45f	movq	%r15, %rdi
000000000016a462	callq	0x3c4fb2                        ## symbol stub for: __Znwm
000000000016a467	orq	$0x1, %r15
000000000016a46b	movq	%r15, -0x90(%rbp)
000000000016a472	movq	%rax, -0x80(%rbp)
000000000016a476	movq	%r13, -0x88(%rbp)
000000000016a47d	movl	%r15d, %r13d
000000000016a480	movq	-0x100(%rbp), %r15
000000000016a487	testb	$0x1, %r13b
000000000016a48b	leaq	-0x8f(%rbp), %r13
000000000016a492	cmovneq	%rax, %r13
000000000016a496	testq	%rbx, %rbx
000000000016a499	je	0x16a4a9
000000000016a49b	movq	%r13, %rdi
000000000016a49e	movq	%r12, %rsi
000000000016a4a1	movq	%rbx, %rdx
000000000016a4a4	callq	0x3c5438                        ## symbol stub for: _memcpy
000000000016a4a9	addq	%rbx, %r13
000000000016a4ac	testq	%r14, %r14
000000000016a4af	je	0x16a4bf
000000000016a4b1	movq	%r13, %rdi
000000000016a4b4	movq	%r15, %rsi
000000000016a4b7	movq	%r14, %rdx
000000000016a4ba	callq	0x3c543e                        ## symbol stub for: _memmove
000000000016a4bf	movb	$0x0, (%r13,%r14)
000000000016a4c5	movzbl	-0x170(%rbp), %edx
000000000016a4cc	testb	$0x1, %dl
000000000016a4cf	je	0x16a4e1
000000000016a4d1	movq	-0x160(%rbp), %rsi
000000000016a4d8	movq	-0x168(%rbp), %rdx
000000000016a4df	jmp	0x16a4ea
000000000016a4e1	shrl	%edx
000000000016a4e3	leaq	-0x16f(%rbp), %rsi
000000000016a4ea	movq	-0x1a8(%rbp), %rbx
000000000016a4f1	movq	-0x1a0(%rbp), %r14
000000000016a4f8	leaq	-0x90(%rbp), %rdi
000000000016a4ff	callq	0x3c4e3e                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcm
000000000016a504	movq	0x10(%rax), %rcx
000000000016a508	movq	%rcx, -0x40(%rbp)
000000000016a50c	movups	(%rax), %xmm0
000000000016a50f	movaps	%xmm0, -0x50(%rbp)
000000000016a513	xorps	%xmm0, %xmm0
000000000016a516	movups	%xmm0, (%rax)
000000000016a519	movq	$0x0, 0x10(%rax)
000000000016a521	movzbl	-0x50(%rbp), %edx
000000000016a525	testb	$0x1, %dl
000000000016a528	je	0x16a534
000000000016a52a	movq	-0x40(%rbp), %rsi
000000000016a52e	movq	-0x48(%rbp), %rdx
000000000016a532	jmp	0x16a53a
000000000016a534	shrl	%edx
000000000016a536	leaq	-0x4f(%rbp), %rsi
000000000016a53a	movq	%rbx, %rdi
000000000016a53d	callq	0x3c4e3e                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcm
000000000016a542	testb	$0x1, -0x50(%rbp)
000000000016a546	jne	0x16a594
000000000016a548	testb	$0x1, -0x90(%rbp)
000000000016a54f	jne	0x16a5a6
000000000016a551	testb	$0x1, -0x70(%rbp)
000000000016a555	jne	0x16a5b5
000000000016a557	testb	$0x1, -0xb0(%rbp)
000000000016a55e	jne	0x16a5c7
000000000016a560	testb	$0x1, -0xf0(%rbp)
000000000016a567	jne	0x16a5dc
000000000016a569	testb	$0x1, -0xd0(%rbp)
000000000016a570	jne	0x16a5ed
000000000016a572	testb	$0x1, -0x170(%rbp)
000000000016a579	jne	0x16a606
000000000016a57f	movq	-0x140(%rbp), %rbx
000000000016a586	testq	%rbx, %rbx
000000000016a589	jne	0x16a670
000000000016a58f	jmp	0x16a61e
000000000016a594	movq	-0x40(%rbp), %rdi
000000000016a598	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016a59d	testb	$0x1, -0x90(%rbp)
000000000016a5a4	je	0x16a551
000000000016a5a6	movq	-0x80(%rbp), %rdi
000000000016a5aa	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016a5af	testb	$0x1, -0x70(%rbp)
000000000016a5b3	je	0x16a557
000000000016a5b5	movq	-0x60(%rbp), %rdi
000000000016a5b9	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016a5be	testb	$0x1, -0xb0(%rbp)
000000000016a5c5	je	0x16a560
000000000016a5c7	movq	-0xa0(%rbp), %rdi
000000000016a5ce	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016a5d3	testb	$0x1, -0xf0(%rbp)
000000000016a5da	je	0x16a569
000000000016a5dc	movq	%r14, %rdi
000000000016a5df	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016a5e4	testb	$0x1, -0xd0(%rbp)
000000000016a5eb	je	0x16a572
000000000016a5ed	movq	-0xc0(%rbp), %rdi
000000000016a5f4	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016a5f9	testb	$0x1, -0x170(%rbp)
000000000016a600	je	0x16a57f
000000000016a606	movq	-0x160(%rbp), %rdi
000000000016a60d	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016a612	movq	-0x140(%rbp), %rbx
000000000016a619	testq	%rbx, %rbx
000000000016a61c	jne	0x16a670
000000000016a61e	movq	-0x150(%rbp), %rdi
000000000016a625	movq	$0x0, -0x150(%rbp)
000000000016a630	testq	%rdi, %rdi
000000000016a633	je	0x16a63a
000000000016a635	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016a63a	movq	-0x120(%rbp), %rbx
000000000016a641	testq	%rbx, %rbx
000000000016a644	je	0x16a6be
000000000016a646	movq	-0x118(%rbp), %r14
000000000016a64d	movq	%rbx, %rdi
000000000016a650	cmpq	%r14, %rbx
000000000016a653	jne	0x16a699
000000000016a655	jmp	0x16a6b2
000000000016a657	nopw	(%rax,%rax)
000000000016a660	movq	%rbx, %rdi
000000000016a663	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016a668	movq	%r14, %rbx
000000000016a66b	testq	%r14, %r14
000000000016a66e	je	0x16a61e
000000000016a670	movq	(%rbx), %r14
000000000016a673	testb	$0x1, 0x18(%rbx)
000000000016a677	je	0x16a660
000000000016a679	movq	0x28(%rbx), %rdi
000000000016a67d	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016a682	jmp	0x16a660
000000000016a684	nopw	%cs:(%rax,%rax)
000000000016a690	addq	$-0x30, %r14
000000000016a694	cmpq	%rbx, %r14
000000000016a697	je	0x16a6ab
000000000016a699	testb	$0x1, -0x28(%r14)
000000000016a69e	je	0x16a690
000000000016a6a0	movq	-0x18(%r14), %rdi
000000000016a6a4	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016a6a9	jmp	0x16a690
000000000016a6ab	movq	-0x120(%rbp), %rdi
000000000016a6b2	movq	%rbx, -0x118(%rbp)
000000000016a6b9	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016a6be	movq	0x897b93(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
000000000016a6c5	movq	(%rax), %rax
000000000016a6c8	cmpq	-0x30(%rbp), %rax
000000000016a6cc	jne	0x16a71a
000000000016a6ce	addq	$0x1d8, %rsp                    ## imm = 0x1D8
000000000016a6d5	popq	%rbx
000000000016a6d6	popq	%r12
000000000016a6d8	popq	%r13
000000000016a6da	popq	%r14
000000000016a6dc	popq	%r15
000000000016a6de	popq	%rbp
000000000016a6df	retq
000000000016a6e0	leaq	0x750530(%rip), %r14            ## literal pool for: "fragmentFunc"
000000000016a6e7	movq	%r14, %rdi
000000000016a6ea	callq	0x3c5612                        ## symbol stub for: _strlen
000000000016a6ef	cmpq	$-0x9, %rax
000000000016a6f3	jb	0x16941a
000000000016a6f9	jmp	0x169487
000000000016a6fe	callq	__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE20__throw_length_errorB9nqe210106Ev ## std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>::__throw_length_error[abi:nqe210106]()
000000000016a703	jmp	0x16a72b
000000000016a705	callq	__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE20__throw_length_errorB9nqe210106Ev ## std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>::__throw_length_error[abi:nqe210106]()
000000000016a70a	jmp	0x16a72b
000000000016a70c	callq	__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE20__throw_length_errorB9nqe210106Ev ## std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>::__throw_length_error[abi:nqe210106]()
000000000016a711	jmp	0x16a72b
000000000016a713	callq	__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE20__throw_length_errorB9nqe210106Ev ## std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>::__throw_length_error[abi:nqe210106]()
000000000016a718	jmp	0x16a72b
000000000016a71a	callq	0x3c5030                        ## symbol stub for: ___stack_chk_fail
000000000016a71f	callq	__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE20__throw_length_errorB9nqe210106Ev ## std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>::__throw_length_error[abi:nqe210106]()
000000000016a724	jmp	0x16a72b
000000000016a726	callq	__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE20__throw_length_errorB9nqe210106Ev ## std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>::__throw_length_error[abi:nqe210106]()
000000000016a72b	ud2
000000000016a72d	jmp	0x16a73a
000000000016a72f	jmp	0x16a74e
000000000016a731	jmp	0x16a866
000000000016a736	jmp	0x16a73a
000000000016a738	jmp	0x16a74e
000000000016a73a	movq	%rax, %rbx
000000000016a73d	testb	$0x1, -0x50(%rbp)
000000000016a741	je	0x16a751
000000000016a743	movq	-0x40(%rbp), %rdi
000000000016a747	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016a74c	jmp	0x16a751
000000000016a74e	movq	%rax, %rbx
000000000016a751	testb	$0x1, -0x90(%rbp)
000000000016a758	je	0x16ab42
000000000016a75e	movq	-0x80(%rbp), %rdi
000000000016a762	jmp	0x16ab38
000000000016a767	movq	%rax, %rbx
000000000016a76a	testb	$0x1, -0xb0(%rbp)
000000000016a771	jne	0x16ab5a
000000000016a777	jmp	0x16ab66
000000000016a77c	movq	%rax, %rbx
000000000016a77f	testb	$0x1, -0xb0(%rbp)
000000000016a786	je	0x16a794
000000000016a788	movq	-0xa0(%rbp), %rdi
000000000016a78f	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016a794	movzbl	-0x100(%rbp), %eax
000000000016a79b	jmp	0x16ab6f
000000000016a7a0	movq	%rax, %rbx
000000000016a7a3	testb	$0x1, -0xf0(%rbp)
000000000016a7aa	je	0x16a7bd
000000000016a7ac	movq	-0xe0(%rbp), %rdi
000000000016a7b3	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016a7b8	jmp	0x16a7bd
000000000016a7ba	movq	%rax, %rbx
000000000016a7bd	testb	$0x1, -0xb0(%rbp)
000000000016a7c4	je	0x16ab7f
000000000016a7ca	movq	-0xa0(%rbp), %rdi
000000000016a7d1	jmp	0x16ab7a
000000000016a7d6	movq	%rax, %rbx
000000000016a7d9	jmp	0x16ab7f
000000000016a7de	movq	%rax, %rbx
000000000016a7e1	jmp	0x16ab7f
000000000016a7e6	movq	%rax, %rbx
000000000016a7e9	testb	$0x1, -0xd0(%rbp)
000000000016a7f0	jne	0x16a817
000000000016a7f2	testb	$0x1, -0xf0(%rbp)
000000000016a7f9	jne	0x16a83a
000000000016a7fb	testb	$0x1, -0xb0(%rbp)
000000000016a802	jne	0x16a916
000000000016a808	testb	$0x1, -0x70(%rbp)
000000000016a80c	jne	0x16a92c
000000000016a812	jmp	0x16ab94
000000000016a817	movq	-0xc0(%rbp), %rdi
000000000016a81e	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016a823	testb	$0x1, -0xf0(%rbp)
000000000016a82a	je	0x16a7fb
000000000016a82c	jmp	0x16a83a
000000000016a82e	movq	%rax, %rbx
000000000016a831	testb	$0x1, -0xf0(%rbp)
000000000016a838	je	0x16a7fb
000000000016a83a	movq	-0xe0(%rbp), %rdi
000000000016a841	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016a846	testb	$0x1, -0xb0(%rbp)
000000000016a84d	je	0x16a808
000000000016a84f	jmp	0x16a916
000000000016a854	movq	%rax, %rbx
000000000016a857	testb	$0x1, -0x70(%rbp)
000000000016a85b	jne	0x16a92c
000000000016a861	jmp	0x16ab94
000000000016a866	movq	%rax, %rbx
000000000016a869	testb	$0x1, -0x148(%rbp)
000000000016a870	je	0x16abb5
000000000016a876	movq	-0x138(%rbp), %rdi
000000000016a87d	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016a882	leaq	-0x120(%rbp), %rdi
000000000016a889	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEED1B9nqe210106Ev ## std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::~vector[abi:nqe210106]()
000000000016a88e	movq	%rbx, %rdi
000000000016a891	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000016a896	jmp	0x16ab3f
000000000016a89b	movq	%rax, %rbx
000000000016a89e	movzbl	-0x100(%rbp), %eax
000000000016a8a5	jmp	0x16ab6f
000000000016a8aa	movq	%rax, %rbx
000000000016a8ad	jmp	0x16ab7f
000000000016a8b2	movq	%rax, %rbx
000000000016a8b5	testb	$0x1, -0xb0(%rbp)
000000000016a8bc	jne	0x16ab5a
000000000016a8c2	jmp	0x16ab66
000000000016a8c7	movq	%rax, %rbx
000000000016a8ca	testb	$0x1, -0xb0(%rbp)
000000000016a8d1	jne	0x16ab5a
000000000016a8d7	jmp	0x16ab66
000000000016a8dc	movq	%rax, %rbx
000000000016a8df	testb	$0x1, -0xb0(%rbp)
000000000016a8e6	jne	0x16ab5a
000000000016a8ec	jmp	0x16ab66
000000000016a8f1	movq	%rax, %rbx
000000000016a8f4	testb	$0x1, -0xb0(%rbp)
000000000016a8fb	jne	0x16ab5a
000000000016a901	jmp	0x16ab66
000000000016a906	movq	%rax, %rbx
000000000016a909	testb	$0x1, -0xb0(%rbp)
000000000016a910	je	0x16a808
000000000016a916	movq	-0xa0(%rbp), %rdi
000000000016a91d	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016a922	testb	$0x1, -0x70(%rbp)
000000000016a926	je	0x16ab94
000000000016a92c	movq	-0x60(%rbp), %rdi
000000000016a930	jmp	0x16ab8f
000000000016a935	jmp	0x16ab3f
000000000016a93a	jmp	0x16a997
000000000016a93c	jmp	0x16aa92
000000000016a941	movq	%rax, %rbx
000000000016a944	testb	$0x1, -0xb0(%rbp)
000000000016a94b	jne	0x16ab5a
000000000016a951	jmp	0x16ab66
000000000016a956	jmp	0x16a9eb
000000000016a95b	movq	%rax, %rbx
000000000016a95e	testb	$0x1, -0x50(%rbp)
000000000016a962	je	0x16a9fa
000000000016a968	jmp	0x16aa22
000000000016a96d	movq	%rax, %rbx
000000000016a970	testb	$0x1, -0xb0(%rbp)
000000000016a977	jne	0x16ab5a
000000000016a97d	jmp	0x16ab66
000000000016a982	movq	%rax, %rbx
000000000016a985	testb	$0x1, -0x90(%rbp)
000000000016a98c	jne	0x16aa49
000000000016a992	jmp	0x16ab51
000000000016a997	movq	%rax, %rbx
000000000016a99a	testb	$0x1, -0x70(%rbp)
000000000016a99e	je	0x16aa95
000000000016a9a4	movq	-0x60(%rbp), %rdi
000000000016a9a8	jmp	0x16aa8b
000000000016a9ad	movq	%rax, %rbx
000000000016a9b0	testb	$0x1, -0xb0(%rbp)
000000000016a9b7	jne	0x16ab5a
000000000016a9bd	jmp	0x16ab66
000000000016a9c2	jmp	0x16aa92
000000000016a9c7	jmp	0x16aa67
000000000016a9cc	jmp	0x16aa7b
000000000016a9d1	movq	%rax, %rbx
000000000016a9d4	testb	$0x1, -0xb0(%rbp)
000000000016a9db	jne	0x16ab5a
000000000016a9e1	jmp	0x16ab66
000000000016a9e6	jmp	0x16aa92
000000000016a9eb	movq	%rax, %rbx
000000000016a9ee	testb	$0x1, -0x70(%rbp)
000000000016a9f2	jne	0x16aa08
000000000016a9f4	testb	$0x1, -0x50(%rbp)
000000000016a9f8	jne	0x16aa22
000000000016a9fa	testb	$0x1, -0x90(%rbp)
000000000016aa01	jne	0x16aa49
000000000016aa03	jmp	0x16ab51
000000000016aa08	movq	-0x60(%rbp), %rdi
000000000016aa0c	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016aa11	testb	$0x1, -0x50(%rbp)
000000000016aa15	je	0x16a9fa
000000000016aa17	jmp	0x16aa22
000000000016aa19	movq	%rax, %rbx
000000000016aa1c	testb	$0x1, -0x50(%rbp)
000000000016aa20	je	0x16a9fa
000000000016aa22	movq	-0x40(%rbp), %rdi
000000000016aa26	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016aa2b	testb	$0x1, -0x90(%rbp)
000000000016aa32	jne	0x16aa49
000000000016aa34	jmp	0x16ab51
000000000016aa39	movq	%rax, %rbx
000000000016aa3c	testb	$0x1, -0x90(%rbp)
000000000016aa43	je	0x16ab51
000000000016aa49	movq	-0x80(%rbp), %rdi
000000000016aa4d	jmp	0x16ab4c
000000000016aa52	movq	%rax, %rbx
000000000016aa55	testb	$0x1, -0xb0(%rbp)
000000000016aa5c	jne	0x16ab5a
000000000016aa62	jmp	0x16ab66
000000000016aa67	movq	%rax, %rbx
000000000016aa6a	testb	$0x1, -0x70(%rbp)
000000000016aa6e	je	0x16aa7e
000000000016aa70	movq	-0x60(%rbp), %rdi
000000000016aa74	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016aa79	jmp	0x16aa7e
000000000016aa7b	movq	%rax, %rbx
000000000016aa7e	testb	$0x1, -0x90(%rbp)
000000000016aa85	je	0x16aa95
000000000016aa87	movq	-0x80(%rbp), %rdi
000000000016aa8b	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016aa90	jmp	0x16aa95
000000000016aa92	movq	%rax, %rbx
000000000016aa95	testb	$0x1, -0x50(%rbp)
000000000016aa99	je	0x16ab51
000000000016aa9f	movq	-0x40(%rbp), %rdi
000000000016aaa3	jmp	0x16ab4c
000000000016aaa8	movq	%rax, %rbx
000000000016aaab	testb	$0x1, -0xb0(%rbp)
000000000016aab2	jne	0x16ab5a
000000000016aab8	jmp	0x16ab66
000000000016aabd	movq	%rax, %rbx
000000000016aac0	jmp	0x16ab94
000000000016aac5	movq	%rax, %rbx
000000000016aac8	jmp	0x16ab28
000000000016aaca	movq	%rax, %rbx
000000000016aacd	jmp	0x16ab16
000000000016aacf	movq	%rax, %rbx
000000000016aad2	jmp	0x16aae6
000000000016aad4	movq	%rax, %rbx
000000000016aad7	testb	$0x1, -0x50(%rbp)
000000000016aadb	je	0x16aae6
000000000016aadd	movq	-0x40(%rbp), %rdi
000000000016aae1	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016aae6	testb	$0x1, -0x1c0(%rbp)
000000000016aaed	je	0x16ab16
000000000016aaef	movq	-0x1b0(%rbp), %rdi
000000000016aaf6	jmp	0x16ab11
000000000016aaf8	jmp	0x16ab3f
000000000016aafa	movq	%rax, %rbx
000000000016aafd	jmp	0x16ab28
000000000016aaff	movq	%rax, %rbx
000000000016ab02	jmp	0x16ab16
000000000016ab04	movq	%rax, %rbx
000000000016ab07	testb	$0x1, -0x50(%rbp)
000000000016ab0b	je	0x16ab16
000000000016ab0d	movq	-0x40(%rbp), %rdi
000000000016ab11	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016ab16	testb	$0x1, -0x90(%rbp)
000000000016ab1d	je	0x16ab28
000000000016ab1f	movq	-0x80(%rbp), %rdi
000000000016ab23	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016ab28	testb	$0x1, -0x198(%rbp)
000000000016ab2f	je	0x16ab42
000000000016ab31	movq	-0x188(%rbp), %rdi
000000000016ab38	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016ab3d	jmp	0x16ab42
000000000016ab3f	movq	%rax, %rbx
000000000016ab42	testb	$0x1, -0x70(%rbp)
000000000016ab46	je	0x16ab51
000000000016ab48	movq	-0x60(%rbp), %rdi
000000000016ab4c	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016ab51	testb	$0x1, -0xb0(%rbp)
000000000016ab58	je	0x16ab66
000000000016ab5a	movq	-0xa0(%rbp), %rdi
000000000016ab61	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016ab66	movzbl	-0xf0(%rbp), %eax
000000000016ab6d	andb	$0x1, %al
000000000016ab6f	testb	%al, %al
000000000016ab71	je	0x16ab7f
000000000016ab73	movq	-0xe0(%rbp), %rdi
000000000016ab7a	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016ab7f	testb	$0x1, -0xd0(%rbp)
000000000016ab86	je	0x16ab94
000000000016ab88	movq	-0xc0(%rbp), %rdi
000000000016ab8f	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016ab94	testb	$0x1, -0x170(%rbp)
000000000016ab9b	je	0x16aba9
000000000016ab9d	movq	-0x160(%rbp), %rdi
000000000016aba4	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000016aba9	leaq	-0x150(%rbp), %rdi
000000000016abb0	callq	__ZNSt3__113unordered_mapImNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEENS_4hashImEENS_8equal_toImEENS4_INS_4pairIKmS6_EEEEED1B9nqe210106Ev ## std::__1::unordered_map<unsigned long, std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>, std::__1::hash<unsigned long>, std::__1::equal_to<unsigned long>, std::__1::allocator<std::__1::pair<unsigned long const, std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>>>>::~unordered_map[abi:nqe210106]()
000000000016abb5	leaq	-0x120(%rbp), %rdi
000000000016abbc	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEED1B9nqe210106Ev ## std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::~vector[abi:nqe210106]()
000000000016abc1	movq	%rbx, %rdi
000000000016abc4	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000016abc9	movq	%rax, %rbx
000000000016abcc	testb	$0x1, -0xb0(%rbp)
000000000016abd3	jne	0x16ab5a
000000000016abd5	jmp	0x16ab66
000000000016abd7	nop
000000000016abd8	clc
000000000016abd9	.byte 0xea #bad opcode
000000000016abda	.byte 0xff #bad opcode
000000000016abdb	.byte 0xff #bad opcode
000000000016abdc	fdiv	%st(2), %st
000000000016abde	.byte 0xff #bad opcode
000000000016abdf	.byte 0xff #bad opcode
000000000016abe0	fdiv	%st(2), %st
000000000016abe2	.byte 0xff #bad opcode
000000000016abe3	decl	-0x1(%rbx,%rbp,8)
000000000016abe7	pushq	(%rdi)
000000000016abe9	jmp	0x16abea
000000000016abeb	ljmpl	*-0x15(%rax)
000000000016abee	.byte 0xff #bad opcode
000000000016abef	.byte 0xff #bad opcode
000000000016abf0	fdiv	%st(2), %st
000000000016abf2	.byte 0xff #bad opcode
000000000016abf3	incl	0x1f0fffff(%rbx,%rbp,8)
000000000016abfa	testb	%al, (%rax)
000000000016abfc	addb	%al, (%rax)
000000000016abfe	addb	%al, (%rax)
