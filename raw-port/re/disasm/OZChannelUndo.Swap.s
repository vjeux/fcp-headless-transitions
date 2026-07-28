__ZN13OZChannelUndo4SwapEv:
00000000000fffa0	pushq	%rbp
00000000000fffa1	movq	%rsp, %rbp
00000000000fffa4	pushq	%r15
00000000000fffa6	pushq	%r14
00000000000fffa8	pushq	%r13
00000000000fffaa	pushq	%r12
00000000000fffac	pushq	%rbx
00000000000fffad	subq	$0x18, %rsp
00000000000fffb1	movq	%rdi, %r12
00000000000fffb4	movq	0x8(%rdi), %rbx
00000000000fffb8	leaq	_theApp(%rip), %rax
00000000000fffbf	movq	(%rax), %rdi
00000000000fffc2	callq	__ZN13OZApplication13getCurrentDocEv ## OZApplication::getCurrentDoc()
00000000000fffc7	movl	$0x2b8, %esi                    ## imm = 0x2B8
00000000000fffcc	addq	0x8(%rax), %rsi
00000000000fffd0	movq	%rbx, %rdi
00000000000fffd3	callq	0x6df4fe                        ## symbol stub for: __ZNK12OZChannelRef10getChannelEP13OZChannelBase
00000000000fffd8	testq	%rax, %rax
00000000000fffdb	je	0x100377
00000000000fffe1	movq	%rax, %r15
00000000000fffe4	movq	(%rax), %rax
00000000000fffe7	movq	%r15, %rdi
00000000000fffea	callq	*0xf8(%rax)
00000000000ffff0	testq	%rax, %rax
00000000000ffff3	je	0x100377
00000000000ffff9	movq	%rax, -0x30(%rbp)
00000000000ffffd	movq	%r15, %rdi
0000000000100000	callq	0x6df55e                        ## symbol stub for: __ZNK13OZChannelBase20getObjectManipulatorEv
0000000000100005	movq	%rax, %rdi
0000000000100008	movq	(%rax), %rax
000000000010000b	movq	%rdi, -0x40(%rbp)
000000000010000f	callq	*0x100(%rax)
0000000000100015	movq	%rax, %r14
0000000000100018	movq	0x538(%rax), %rdi
000000000010001f	movq	0x588(%rax), %rax
0000000000100026	movq	%rax, -0x38(%rbp)
000000000010002a	xorl	%esi, %esi
000000000010002c	callq	__ZN15OZRenderManager5abortEb   ## OZRenderManager::abort(bool)
0000000000100031	movq	%r15, %rdi
0000000000100034	xorl	%esi, %esi
0000000000100036	callq	0x6df576                        ## symbol stub for: __ZNK13OZChannelBase8isLockedEb
000000000010003b	movl	%eax, %ebx
000000000010003d	movq	0x10(%r12), %rdi
0000000000100042	xorl	%esi, %esi
0000000000100044	callq	0x6df576                        ## symbol stub for: __ZNK13OZChannelBase8isLockedEb
0000000000100049	xorb	%bl, %al
000000000010004b	movzbl	%al, %ebx
000000000010004e	shll	$0x7, %ebx
0000000000100051	orl	$0xc, %ebx
0000000000100054	movq	(%r15), %rax
0000000000100057	movq	0x30(%r15), %r13
000000000010005b	movq	%r15, %rdi
000000000010005e	callq	*0x160(%rax)
0000000000100064	movq	0x10(%r12), %rsi
0000000000100069	movq	(%r15), %rax
000000000010006c	movq	%r15, %rdi
000000000010006f	xorl	%edx, %edx
0000000000100071	callq	*0xe8(%rax)
0000000000100077	movq	(%r15), %rax
000000000010007a	movq	%r15, %rdi
000000000010007d	callq	*0x168(%rax)
0000000000100083	movq	%r13, 0x30(%r15)
0000000000100087	movq	0x10(%r12), %rdi
000000000010008c	testq	%rdi, %rdi
000000000010008f	je	0x100097
0000000000100091	movq	(%rdi), %rax
0000000000100094	callq	*0x8(%rax)
0000000000100097	movq	-0x30(%rbp), %rax
000000000010009b	movq	%rax, 0x10(%r12)
00000000001000a0	movq	-0x40(%rbp), %r12
00000000001000a4	movq	(%r12), %rax
00000000001000a8	movq	%r12, %rdi
00000000001000ab	callq	*0x1a8(%rax)
00000000001000b1	movq	%r14, %rdi
00000000001000b4	callq	__ZN7OZScene14updateSoloFlagEv  ## OZScene::updateSoloFlag()
00000000001000b9	movq	-0x38(%rbp), %r14
00000000001000bd	movq	%r14, %rdi
00000000001000c0	movl	%ebx, %esi
00000000001000c2	callq	__ZN10OZDocument16postNotificationEj ## OZDocument::postNotification(unsigned int)
00000000001000c7	movq	0x722662(%rip), %rsi            ## literal pool symbol address: __ZTI13OZChannelBase
00000000001000ce	leaq	__ZTI23OZ3DExtrusionProperties(%rip), %rdx ## typeinfo for OZ3DExtrusionProperties
00000000001000d5	movq	%r15, %rdi
00000000001000d8	xorl	%ecx, %ecx
00000000001000da	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
00000000001000df	testq	%rax, %rax
00000000001000e2	jne	0x100101
00000000001000e4	movq	0x722645(%rip), %rsi            ## literal pool symbol address: __ZTI13OZChannelBase
00000000001000eb	leaq	__ZTI22OZMaterialLayersFolder(%rip), %rdx ## typeinfo for OZMaterialLayersFolder
00000000001000f2	movq	%r15, %rdi
00000000001000f5	xorl	%ecx, %ecx
00000000001000f7	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
00000000001000fc	testq	%rax, %rax
00000000001000ff	je	0x10010e
0000000000100101	movq	%r14, %rdi
0000000000100104	movl	$0x80000, %esi                  ## imm = 0x80000
0000000000100109	callq	__ZN10OZDocument16postNotificationEj ## OZDocument::postNotification(unsigned int)
000000000010010e	movq	0x72261b(%rip), %rsi            ## literal pool symbol address: __ZTI13OZChannelBase
0000000000100115	leaq	__ZTI19OZChannelObjectRoot(%rip), %rdx ## typeinfo for OZChannelObjectRoot
000000000010011c	movq	%r15, %rdi
000000000010011f	xorl	%ecx, %ecx
0000000000100121	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
0000000000100126	testq	%rax, %rax
0000000000100129	je	0x100138
000000000010012b	movq	%r14, %rdi
000000000010012e	movl	$0x1400, %esi                   ## imm = 0x1400
0000000000100133	callq	__ZN10OZDocument16postNotificationEj ## OZDocument::postNotification(unsigned int)
0000000000100138	movq	0x7225f1(%rip), %rsi            ## literal pool symbol address: __ZTI13OZChannelBase
000000000010013f	leaq	__ZTI16OZChanFootageRef(%rip), %rdx ## typeinfo for OZChanFootageRef
0000000000100146	movq	%r15, %rdi
0000000000100149	xorl	%ecx, %ecx
000000000010014b	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
0000000000100150	testq	%rax, %rax
0000000000100153	jne	0x100172
0000000000100155	movq	0x7225d4(%rip), %rsi            ## literal pool symbol address: __ZTI13OZChannelBase
000000000010015c	movq	0x726e7d(%rip), %rdx            ## literal pool symbol address: __ZTI26OZChanFootageRefWithPicker
0000000000100163	movq	%r15, %rdi
0000000000100166	xorl	%ecx, %ecx
0000000000100168	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
000000000010016d	testq	%rax, %rax
0000000000100170	je	0x10019f
0000000000100172	leaq	__ZTI19OZObjectManipulator(%rip), %rsi ## typeinfo for OZObjectManipulator
0000000000100179	leaq	__ZTI12OZAudioTrack(%rip), %rdx ## typeinfo for OZAudioTrack
0000000000100180	movl	$0x10, %ecx
0000000000100185	movq	%r12, %rdi
0000000000100188	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
000000000010018d	testq	%rax, %rax
0000000000100190	je	0x10019f
0000000000100192	movq	%r14, %rdi
0000000000100195	movl	$0x10, %esi
000000000010019a	callq	__ZN10OZDocument16postNotificationEj ## OZDocument::postNotification(unsigned int)
000000000010019f	movq	0x72258a(%rip), %rsi            ## literal pool symbol address: __ZTI13OZChannelBase
00000000001001a6	movq	0x726e7b(%rip), %rdx            ## literal pool symbol address: __ZTI29OZChanAudioTrackRefWithPicker
00000000001001ad	movq	%r15, %rdi
00000000001001b0	xorl	%ecx, %ecx
00000000001001b2	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
00000000001001b7	testq	%rax, %rax
00000000001001ba	je	0x1001e9
00000000001001bc	leaq	__ZTI19OZObjectManipulator(%rip), %rsi ## typeinfo for OZObjectManipulator
00000000001001c3	leaq	__ZTI15OZAudioBehavior(%rip), %rdx ## typeinfo for OZAudioBehavior
00000000001001ca	movl	$0x10, %ecx
00000000001001cf	movq	%r12, %rdi
00000000001001d2	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
00000000001001d7	testq	%rax, %rax
00000000001001da	je	0x1001e9
00000000001001dc	movq	%r14, %rdi
00000000001001df	movl	$0x10, %esi
00000000001001e4	callq	__ZN10OZDocument16postNotificationEj ## OZDocument::postNotification(unsigned int)
00000000001001e9	movq	0x722540(%rip), %rsi            ## literal pool symbol address: __ZTI13OZChannelBase
00000000001001f0	movq	0x722619(%rip), %rdx            ## literal pool symbol address: __ZTI22OZChannelVaryingFolder
00000000001001f7	movq	%r15, %rdi
00000000001001fa	xorl	%ecx, %ecx
00000000001001fc	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
0000000000100201	testq	%rax, %rax
0000000000100204	jne	0x100217
0000000000100206	movl	$0x20000000, %esi               ## imm = 0x20000000
000000000010020b	movq	%r15, %rdi
000000000010020e	callq	0x6df57c                        ## symbol stub for: __ZNK13OZChannelBase8testFlagEy
0000000000100213	testb	%al, %al
0000000000100215	je	0x100224
0000000000100217	movq	%r14, %rdi
000000000010021a	movl	$0x80000, %esi                  ## imm = 0x80000
000000000010021f	callq	__ZN10OZDocument16postNotificationEj ## OZDocument::postNotification(unsigned int)
0000000000100224	movq	0x722505(%rip), %rsi            ## literal pool symbol address: __ZTI13OZChannelBase
000000000010022b	movq	0x726d16(%rip), %rdx            ## literal pool symbol address: __ZTI22OZChannelEnumDimension
0000000000100232	movq	%r15, %rdi
0000000000100235	xorl	%ecx, %ecx
0000000000100237	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
000000000010023c	testq	%rax, %rax
000000000010023f	je	0x10026e
0000000000100241	leaq	__ZTI19OZObjectManipulator(%rip), %rsi ## typeinfo for OZObjectManipulator
0000000000100248	leaq	__ZTI7OZGroup(%rip), %rdx       ## typeinfo for OZGroup
000000000010024f	movl	$0x10, %ecx
0000000000100254	movq	%r12, %rdi
0000000000100257	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
000000000010025c	testq	%rax, %rax
000000000010025f	je	0x10026e
0000000000100261	movq	%r14, %rdi
0000000000100264	movl	$0x80000, %esi                  ## imm = 0x80000
0000000000100269	callq	__ZN10OZDocument16postNotificationEj ## OZDocument::postNotification(unsigned int)
000000000010026e	movq	0x7224bb(%rip), %rsi            ## literal pool symbol address: __ZTI13OZChannelBase
0000000000100275	leaq	__ZTI20OZChanObjectManipRef(%rip), %rdx ## typeinfo for OZChanObjectManipRef
000000000010027c	movq	%r15, %rdi
000000000010027f	xorl	%ecx, %ecx
0000000000100281	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
0000000000100286	testq	%rax, %rax
0000000000100289	je	0x1002b8
000000000010028b	leaq	__ZTI19OZObjectManipulator(%rip), %rsi ## typeinfo for OZObjectManipulator
0000000000100292	leaq	__ZTI10OZBehavior(%rip), %rdx   ## typeinfo for OZBehavior
0000000000100299	movl	$0x10, %ecx
000000000010029e	movq	%r12, %rdi
00000000001002a1	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
00000000001002a6	testq	%rax, %rax
00000000001002a9	je	0x1002b8
00000000001002ab	movq	%r14, %rdi
00000000001002ae	movl	$0x10, %esi
00000000001002b3	callq	__ZN10OZDocument16postNotificationEj ## OZDocument::postNotification(unsigned int)
00000000001002b8	movq	0x722471(%rip), %rsi            ## literal pool symbol address: __ZTI13OZChannelBase
00000000001002bf	movq	0x726c32(%rip), %rdx            ## literal pool symbol address: __ZTI18OZChannelEnumLayer
00000000001002c6	movq	%r15, %rdi
00000000001002c9	xorl	%ecx, %ecx
00000000001002cb	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
00000000001002d0	testq	%rax, %rax
00000000001002d3	jne	0x1002f2
00000000001002d5	movq	0x722454(%rip), %rsi            ## literal pool symbol address: __ZTI13OZChannelBase
00000000001002dc	movq	0x72245d(%rip), %rdx            ## literal pool symbol address: __ZTI13OZChannelEnum
00000000001002e3	movq	%r15, %rdi
00000000001002e6	xorl	%ecx, %ecx
00000000001002e8	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
00000000001002ed	testq	%rax, %rax
00000000001002f0	je	0x10033c
00000000001002f2	leaq	__ZTI19OZObjectManipulator(%rip), %rsi ## typeinfo for OZObjectManipulator
00000000001002f9	leaq	__ZTI14OZImageElement(%rip), %rdx ## typeinfo for OZImageElement
0000000000100300	movl	$0x10, %ecx
0000000000100305	movq	%r12, %rdi
0000000000100308	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
000000000010030d	testq	%rax, %rax
0000000000100310	setne	%cl
0000000000100313	leaq	0x5b80(%rax), %rdx
000000000010031a	cmpq	%rdx, %r15
000000000010031d	sete	%dl
0000000000100320	andb	%cl, %dl
0000000000100322	cmpb	$0x1, %dl
0000000000100325	jne	0x10033c
0000000000100327	movq	%rax, %rdi
000000000010032a	callq	__ZN14OZImageElement12resetFitModeEv ## OZImageElement::resetFitMode()
000000000010032f	movq	%r14, %rdi
0000000000100332	movl	$0x80010, %esi                  ## imm = 0x80010
0000000000100337	callq	__ZN10OZDocument16postNotificationEj ## OZDocument::postNotification(unsigned int)
000000000010033c	leaq	__ZTI19OZObjectManipulator(%rip), %rsi ## typeinfo for OZObjectManipulator
0000000000100343	leaq	__ZTI11OZRotoshape(%rip), %rdx  ## typeinfo for OZRotoshape
000000000010034a	movl	$0xd8, %ecx
000000000010034f	movq	%r12, %rdi
0000000000100352	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
0000000000100357	testq	%rax, %rax
000000000010035a	je	0x100377
000000000010035c	movq	%r14, %rdi
000000000010035f	movl	$0x10000000, %esi               ## imm = 0x10000000
0000000000100364	addq	$0x18, %rsp
0000000000100368	popq	%rbx
0000000000100369	popq	%r12
000000000010036b	popq	%r13
000000000010036d	popq	%r14
000000000010036f	popq	%r15
0000000000100371	popq	%rbp
0000000000100372	jmp	__ZN10OZDocument16postNotificationEj ## OZDocument::postNotification(unsigned int)
0000000000100377	addq	$0x18, %rsp
000000000010037b	popq	%rbx
000000000010037c	popq	%r12
000000000010037e	popq	%r13
0000000000100380	popq	%r14
0000000000100382	popq	%r15
0000000000100384	popq	%rbp
0000000000100385	retq
0000000000100386	nopw	%cs:(%rax,%rax)
