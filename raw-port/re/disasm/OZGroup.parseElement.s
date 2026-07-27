__ZN7OZGroup12parseElementER22PCSerializerReadStreamR15PCStreamElement:
00000000000eea80	pushq	%rbp
00000000000eea81	movq	%rsp, %rbp
00000000000eea84	pushq	%r15
00000000000eea86	pushq	%r14
00000000000eea88	pushq	%r13
00000000000eea8a	pushq	%r12
00000000000eea8c	pushq	%rbx
00000000000eea8d	subq	$0x48, %rsp
00000000000eea91	movq	%rdx, %r15
00000000000eea94	movq	%rsi, %rbx
00000000000eea97	movq	%rdi, %r14
00000000000eea9a	leaq	-0x38(%rbp), %rdi
00000000000eea9e	callq	0x6df0c0                        ## symbol stub for: __ZN8PCStringC1Ev
00000000000eeaa3	leaq	-0x40(%rbp), %rdi
00000000000eeaa7	callq	0x6df0c0                        ## symbol stub for: __ZN8PCStringC1Ev
00000000000eeaac	leaq	-0x48(%rbp), %rdi
00000000000eeab0	callq	0x6df0c0                        ## symbol stub for: __ZN8PCStringC1Ev
00000000000eeab5	movq	$0x0, -0x58(%rbp)
00000000000eeabd	movl	$0x0, -0x4c(%rbp)
00000000000eeac4	movb	$0x0, -0x29(%rbp)
00000000000eeac8	movq	%r14, %rdi
00000000000eeacb	movq	%rbx, %rsi
00000000000eeace	movq	%r15, %rdx
00000000000eead1	callq	__ZN9OZElement12parseElementER22PCSerializerReadStreamR15PCStreamElement ## OZElement::parseElement(PCSerializerReadStream&, PCStreamElement&)
00000000000eead6	movl	0x8(%r15), %eax
00000000000eeada	cmpl	$0x3d, %eax
00000000000eeadd	je	0xeecbc
00000000000eeae3	cmpl	$0x3e, %eax
00000000000eeae6	je	0xeeb45
00000000000eeae8	cmpl	$0x3f, %eax
00000000000eeaeb	jne	0xeedde
00000000000eeaf1	leaq	-0x38(%rbp), %rcx
00000000000eeaf5	movq	%rbx, %rdi
00000000000eeaf8	movq	%r15, %rsi
00000000000eeafb	movl	$0x6e, %edx
00000000000eeb00	callq	0x6df792                        ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsStringERK15PCStreamElementjP8PCString
00000000000eeb05	leaq	-0x30(%rbp), %rcx
00000000000eeb09	movq	%rbx, %rdi
00000000000eeb0c	movq	%r15, %rsi
00000000000eeb0f	movl	$0x6f, %edx
00000000000eeb14	callq	0x6df798                        ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsUInt32ERK15PCStreamElementjPj
00000000000eeb19	movl	-0x30(%rbp), %ecx
00000000000eeb1c	leaq	_theApp(%rip), %rax
00000000000eeb23	movq	(%rax), %rdi
00000000000eeb26	movdqa	0x616a12(%rip), %xmm0
00000000000eeb2e	movdqa	%xmm0, -0x70(%rbp)
00000000000eeb33	leaq	-0x70(%rbp), %rsi
00000000000eeb37	leaq	-0x38(%rbp), %rdx
00000000000eeb3b	callq	__ZN13OZApplication15createSceneNodeERK6PCUUIDRK8PCStringj ## OZApplication::createSceneNode(PCUUID const&, PCString const&, unsigned int)
00000000000eeb40	jmp	0xeed0b
00000000000eeb45	leaq	-0x5c(%rbp), %rcx
00000000000eeb49	movq	%rbx, %rdi
00000000000eeb4c	movq	%r15, %rsi
00000000000eeb4f	movl	$0x71, %edx
00000000000eeb54	callq	0x6df798                        ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsUInt32ERK15PCStreamElementjPj
00000000000eeb59	leaq	-0x38(%rbp), %rcx
00000000000eeb5d	movq	%rbx, %rdi
00000000000eeb60	movq	%r15, %rsi
00000000000eeb63	movl	$0x6e, %edx
00000000000eeb68	callq	0x6df792                        ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsStringERK15PCStreamElementjP8PCString
00000000000eeb6d	leaq	-0x30(%rbp), %rcx
00000000000eeb71	movq	%rbx, %rdi
00000000000eeb74	movq	%r15, %rsi
00000000000eeb77	movl	$0x6f, %edx
00000000000eeb7c	callq	0x6df798                        ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsUInt32ERK15PCStreamElementjPj
00000000000eeb81	leaq	-0x48(%rbp), %rcx
00000000000eeb85	movq	%rbx, %rdi
00000000000eeb88	movq	%r15, %rsi
00000000000eeb8b	movl	$0x7, %edx
00000000000eeb90	callq	0x6df792                        ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsStringERK15PCStreamElementjP8PCString
00000000000eeb95	leaq	-0x4c(%rbp), %rcx
00000000000eeb99	movq	%rbx, %rdi
00000000000eeb9c	movq	%r15, %rsi
00000000000eeb9f	movl	$0x8, %edx
00000000000eeba4	callq	0x6df786                        ## symbol stub for: __ZNK22PCSerializerReadStream19getAttributeAsInt32ERK15PCStreamElementjPi
00000000000eeba9	leaq	-0x29(%rbp), %rcx
00000000000eebad	movq	%rbx, %rdi
00000000000eebb0	movq	%r15, %rsi
00000000000eebb3	movl	$0x9, %edx
00000000000eebb8	callq	0x6df77a                        ## symbol stub for: __ZNK22PCSerializerReadStream18getAttributeAsBoolERK15PCStreamElementjPb
00000000000eebbd	leaq	-0x40(%rbp), %rcx
00000000000eebc1	movq	%rbx, %rdi
00000000000eebc4	movq	%r15, %rsi
00000000000eebc7	movl	$0x76, %edx
00000000000eebcc	callq	0x6df792                        ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsStringERK15PCStreamElementjP8PCString
00000000000eebd1	testb	%al, %al
00000000000eebd3	jne	0xeebe2
00000000000eebd5	leaq	-0x40(%rbp), %rdi
00000000000eebd9	leaq	-0x38(%rbp), %rsi
00000000000eebdd	callq	0x6df048                        ## symbol stub for: __ZN8PCString3setERKS_
00000000000eebe2	leaq	-0x58(%rbp), %rcx
00000000000eebe6	movq	%rbx, %rdi
00000000000eebe9	movq	%r15, %rsi
00000000000eebec	movl	$0x74, %edx
00000000000eebf1	callq	0x6df78c                        ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsDoubleERK15PCStreamElementjPd
00000000000eebf6	leaq	_theApp(%rip), %rax
00000000000eebfd	movq	(%rax), %rax
00000000000eec00	movl	-0x5c(%rbp), %esi
00000000000eec03	movq	0x20(%rax), %rdi
00000000000eec07	callq	0x6dd5ba                        ## symbol stub for: __ZN11OZFactories13lookupFactoryEj
00000000000eec0c	movl	$0x18, %r15d
00000000000eec12	testq	%rax, %rax
00000000000eec15	je	0xeedd4
00000000000eec1b	movq	0x733c56(%rip), %rsi            ## literal pool symbol address: __ZTI9OZFactory
00000000000eec22	movq	0x7382e7(%rip), %rdx            ## literal pool symbol address: __ZTI18OZSceneNodeFactory
00000000000eec29	movq	%rax, %rdi
00000000000eec2c	xorl	%ecx, %ecx
00000000000eec2e	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
00000000000eec33	testq	%rax, %rax
00000000000eec36	je	0xeedd4
00000000000eec3c	movq	%rax, %r13
00000000000eec3f	movdqu	0x8(%rax), %xmm0
00000000000eec44	pxor	0x616a84(%rip), %xmm0
00000000000eec4c	ptest	%xmm0, %xmm0
00000000000eec51	je	0xeedce
00000000000eec57	movq	0x7382b2(%rip), %r15            ## literal pool symbol address: __ZTI18OZSceneNodeFactory
00000000000eec5e	movq	0x7382d3(%rip), %rdx            ## literal pool symbol address: __ZTI21OZFxGenerator_Factory
00000000000eec65	movq	%r13, %rdi
00000000000eec68	movq	%r15, %rsi
00000000000eec6b	xorl	%ecx, %ecx
00000000000eec6d	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
00000000000eec72	movq	%rax, %r12
00000000000eec75	movq	0x738454(%rip), %rdx            ## literal pool symbol address: __ZTI39OZSnowflakeReplacementGenerator_Factory
00000000000eec7c	movq	%r13, %rdi
00000000000eec7f	movq	%r15, %rsi
00000000000eec82	xorl	%ecx, %ecx
00000000000eec84	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
00000000000eec89	testq	%rax, %rax
00000000000eec8c	je	0xeee0a
00000000000eec92	movsd	0x616746(%rip), %xmm0
00000000000eec9a	ucomisd	-0x58(%rbp), %xmm0
00000000000eec9f	jbe	0xeee0a
00000000000eeca5	xorl	%r15d, %r15d
00000000000eeca8	movl	-0x30(%rbp), %edx
00000000000eecab	leaq	-0x40(%rbp), %rsi
00000000000eecaf	movq	%rax, %rdi
00000000000eecb2	callq	__ZN39OZSnowflakeReplacementGenerator_Factory13createOldNodeERK8PCStringj ## OZSnowflakeReplacementGenerator_Factory::createOldNode(PCString const&, unsigned int)
00000000000eecb7	jmp	0xeee73
00000000000eecbc	leaq	-0x38(%rbp), %rcx
00000000000eecc0	movq	%rbx, %rdi
00000000000eecc3	movq	%r15, %rsi
00000000000eecc6	movl	$0x6e, %edx
00000000000eeccb	callq	0x6df792                        ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsStringERK15PCStreamElementjP8PCString
00000000000eecd0	leaq	-0x30(%rbp), %rcx
00000000000eecd4	movq	%rbx, %rdi
00000000000eecd7	movq	%r15, %rsi
00000000000eecda	movl	$0x6f, %edx
00000000000eecdf	callq	0x6df798                        ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsUInt32ERK15PCStreamElementjPj
00000000000eece4	movl	-0x30(%rbp), %ecx
00000000000eece7	leaq	_theApp(%rip), %rax
00000000000eecee	movq	(%rax), %rdi
00000000000eecf1	movdqa	0x616837(%rip), %xmm0
00000000000eecf9	movdqa	%xmm0, -0x70(%rbp)
00000000000eecfe	leaq	-0x70(%rbp), %rsi
00000000000eed02	leaq	-0x38(%rbp), %rdx
00000000000eed06	callq	__ZN13OZApplication15createSceneNodeERK6PCUUIDRK8PCStringj ## OZApplication::createSceneNode(PCUUID const&, PCString const&, unsigned int)
00000000000eed0b	movq	%rax, %r15
00000000000eed0e	testq	%r15, %r15
00000000000eed11	je	0xeedde
00000000000eed17	movl	-0x30(%rbp), %esi
00000000000eed1a	leaq	0x30(%r15), %rdi
00000000000eed1e	callq	0x6dd8fc                        ## symbol stub for: __ZN13OZChannelBase5setIDEj
00000000000eed23	movq	(%r15), %rax
00000000000eed26	movq	%r15, %rdi
00000000000eed29	movq	%r14, %rsi
00000000000eed2c	callq	*0x100(%rax)
00000000000eed32	movl	$0x18, %edi
00000000000eed37	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000000eed3c	leaq	"-[OZMagnifyTool draw]"(%r14), %rcx
00000000000eed43	movq	%r15, 0x10(%rax)
00000000000eed47	movq	%rcx, 0x8(%rax)
00000000000eed4b	movq	"-[OZMagnifyTool draw]"(%r14), %rcx
00000000000eed52	movq	%rcx, (%rax)
00000000000eed55	movq	%rax, 0x8(%rcx)
00000000000eed59	movq	%rax, "-[OZMagnifyTool draw]"(%r14)
00000000000eed60	incq	0x4960(%r14)
00000000000eed67	movq	(%r15), %rax
00000000000eed6a	movq	%r15, %rdi
00000000000eed6d	callq	*0x280(%rax)
00000000000eed73	leaq	0x30(%r14), %rdi
00000000000eed77	movq	%rax, %rsi
00000000000eed7a	callq	0x6ddfec                        ## symbol stub for: __ZN15OZChannelFolder9push_backEP13OZChannelBase
00000000000eed7f	movq	(%r15), %rax
00000000000eed82	movq	%r15, %rdi
00000000000eed85	callq	*0x280(%rax)
00000000000eed8b	movl	$0x40, %esi
00000000000eed90	movq	%rax, %rdi
00000000000eed93	xorl	%edx, %edx
00000000000eed95	callq	0x6dd92c                        ## symbol stub for: __ZN13OZChannelBase9resetFlagEyb
00000000000eed9a	movq	0x3c0(%r14), %rdi
00000000000eeda1	testq	%rdi, %rdi
00000000000eeda4	je	0xeedbd
00000000000eeda6	movq	%r15, %rsi
00000000000eeda9	callq	__ZN7OZScene12registerNodeEP11OZSceneNode ## OZScene::registerNode(OZSceneNode*)
00000000000eedae	movq	0x3c0(%r14), %rdi
00000000000eedb5	movq	%r15, %rsi
00000000000eedb8	callq	__ZN7OZScene18addAllDependenciesEP11OZSceneNode ## OZScene::addAllDependencies(OZSceneNode*)
00000000000eedbd	addq	$0x28, %r15
00000000000eedc1	movq	%rbx, %rdi
00000000000eedc4	movq	%r15, %rsi
00000000000eedc7	callq	0x6de790                        ## symbol stub for: __ZN22PCSerializerReadStream11pushHandlerEP12PCSerializer
00000000000eedcc	jmp	0xeedde
00000000000eedce	movl	$0x28, %r15d
00000000000eedd4	movq	(%rbx), %rax
00000000000eedd7	movq	%rbx, %rdi
00000000000eedda	callq	*(%rax,%r15)
00000000000eedde	leaq	-0x48(%rbp), %rdi
00000000000eede2	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000000eede7	leaq	-0x40(%rbp), %rdi
00000000000eedeb	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000000eedf0	leaq	-0x38(%rbp), %rdi
00000000000eedf4	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000000eedf9	movb	$0x1, %al
00000000000eedfb	addq	$0x48, %rsp
00000000000eedff	popq	%rbx
00000000000eee00	popq	%r12
00000000000eee02	popq	%r13
00000000000eee04	popq	%r14
00000000000eee06	popq	%r15
00000000000eee08	popq	%rbp
00000000000eee09	retq
00000000000eee0a	xorl	%r15d, %r15d
00000000000eee0d	testq	%r12, %r12
00000000000eee10	je	0xeee47
00000000000eee12	leaq	-0x48(%rbp), %rdi
00000000000eee16	callq	0x6dfa32                        ## symbol stub for: __ZNK8PCString5emptyEv
00000000000eee1b	movl	-0x30(%rbp), %edx
00000000000eee1e	movl	-0x4c(%rbp), %ecx
00000000000eee21	movzbl	-0x29(%rbp), %esi
00000000000eee25	movq	(%r12), %rdi
00000000000eee29	movq	0xc8(%rdi), %r9
00000000000eee30	xorl	%r15d, %r15d
00000000000eee33	testb	%al, %al
00000000000eee35	je	0xeee9d
00000000000eee37	movzbl	%sil, %r8d
00000000000eee3b	leaq	-0x40(%rbp), %rsi
00000000000eee3f	movq	%r12, %rdi
00000000000eee42	callq	*%r9
00000000000eee45	jmp	0xeee73
00000000000eee47	leaq	-0x48(%rbp), %r12
00000000000eee4b	movq	%r12, %rdi
00000000000eee4e	callq	0x6dfa32                        ## symbol stub for: __ZNK8PCString5emptyEv
00000000000eee53	leaq	-0x40(%rbp), %rsi
00000000000eee57	movl	-0x30(%rbp), %edx
00000000000eee5a	movq	(%r13), %rcx
00000000000eee5e	testb	%al, %al
00000000000eee60	cmovneq	%rsi, %r12
00000000000eee64	xorl	%r15d, %r15d
00000000000eee67	movq	%r13, %rdi
00000000000eee6a	movq	%r12, %rsi
00000000000eee6d	callq	*0xa8(%rcx)
00000000000eee73	movq	%rax, %r15
00000000000eee76	movq	-0x58(%rbp), %xmm0
00000000000eee7b	movq	(%r15), %rax
00000000000eee7e	movq	%r15, %rdi
00000000000eee81	callq	*0x4b0(%rax)
00000000000eee87	leaq	0x10(%r15), %rdi
00000000000eee8b	movq	0x10(%r15), %rax
00000000000eee8f	leaq	-0x38(%rbp), %rsi
00000000000eee93	xorl	%edx, %edx
00000000000eee95	callq	*0x70(%rax)
00000000000eee98	jmp	0xeed17
00000000000eee9d	movzbl	%sil, %r8d
00000000000eeea1	leaq	-0x48(%rbp), %rsi
00000000000eeea5	movq	%r12, %rdi
00000000000eeea8	callq	*%r9
00000000000eeeab	movq	%rax, %r15
00000000000eeeae	testq	%rax, %rax
00000000000eeeb1	je	0xeeed0
00000000000eeeb3	leaq	__ZTI11OZSceneNode(%rip), %rsi  ## typeinfo for OZSceneNode
00000000000eeeba	leaq	__ZTI13OZFxGenerator(%rip), %rdx ## typeinfo for OZFxGenerator
00000000000eeec1	movq	%r15, %rdi
00000000000eeec4	xorl	%ecx, %ecx
00000000000eeec6	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
00000000000eeecb	movq	%rax, %rdi
00000000000eeece	jmp	0xeeed2
00000000000eeed0	xorl	%edi, %edi
00000000000eeed2	leaq	-0x40(%rbp), %rsi
00000000000eeed6	callq	__ZN13OZFxGenerator15setInternalNameERK8PCString ## OZFxGenerator::setInternalName(PCString const&)
00000000000eeedb	jmp	0xeee76
00000000000eeedd	xorl	%r15d, %r15d
00000000000eeee0	jmp	0xeeee2
00000000000eeee2	movq	%rax, %rdi
00000000000eeee5	callq	0x6dfcd8                        ## symbol stub for: ___cxa_begin_catch
00000000000eeeea	movq	(%rbx), %rax
00000000000eeeed	movq	%rbx, %rdi
00000000000eeef0	callq	*0x18(%rax)
00000000000eeef3	callq	0x6dfcde                        ## symbol stub for: ___cxa_end_catch
00000000000eeef8	jmp	0xeed0e
00000000000eeefd	movq	%rax, %rbx
00000000000eef00	callq	0x6dfcde                        ## symbol stub for: ___cxa_end_catch
00000000000eef05	jmp	0xeef2b
00000000000eef07	movq	%rax, %rdi
00000000000eef0a	callq	___clang_call_terminate
00000000000eef0f	movq	%rax, %rbx
00000000000eef12	jmp	0xeef34
00000000000eef14	movq	%rax, %rbx
00000000000eef17	leaq	-0x38(%rbp), %rdi
00000000000eef1b	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000000eef20	movq	%rbx, %rdi
00000000000eef23	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000000eef28	movq	%rax, %rbx
00000000000eef2b	leaq	-0x48(%rbp), %rdi
00000000000eef2f	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000000eef34	leaq	-0x40(%rbp), %rdi
00000000000eef38	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000000eef3d	leaq	-0x38(%rbp), %rdi
00000000000eef41	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000000eef46	movq	%rbx, %rdi
00000000000eef49	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000000eef4e	nop
