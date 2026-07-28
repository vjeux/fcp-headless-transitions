__ZN20OZHGAudioPrefetchJobC2ERK6CMTimeP7OZScenej:
0000000000636a80	pushq	%rbp
0000000000636a81	movq	%rsp, %rbp
0000000000636a84	pushq	%r15
0000000000636a86	pushq	%r14
0000000000636a88	pushq	%r12
0000000000636a8a	pushq	%rbx
0000000000636a8b	movl	%ecx, %r14d
0000000000636a8e	movq	%rdx, %r15
0000000000636a91	movq	%rsi, %r12
0000000000636a94	movq	%rdi, %rbx
0000000000636a97	callq	__ZN11OZHGUserJobC2Ev           ## OZHGUserJob::OZHGUserJob()
0000000000636a9c	leaq	0x251995(%rip), %rax
0000000000636aa3	movq	%rax, (%rbx)
0000000000636aa6	movups	(%r12), %xmm0
0000000000636aab	movups	%xmm0, 0x90(%rbx)
0000000000636ab2	movq	0x10(%r12), %rax
0000000000636ab7	movq	%rax, 0xa0(%rbx)
0000000000636abe	movq	%r15, 0xa8(%rbx)
0000000000636ac5	movl	%r14d, 0xb0(%rbx)
0000000000636acc	callq	0x6de0b8                        ## symbol stub for: __ZN15PGHGRenderQueue18getPrefetchQueueIDEv
0000000000636ad1	movq	%rbx, %rdi
0000000000636ad4	movl	%eax, %esi
0000000000636ad6	callq	0x6df228                        ## symbol stub for: __ZN9HGUserJob10SetQueueIDEj
0000000000636adb	movq	%rbx, %rdi
0000000000636ade	movl	$0xa, %esi
0000000000636ae3	callq	0x6df22e                        ## symbol stub for: __ZN9HGUserJob11SetPriorityENS_8PriorityE
0000000000636ae8	popq	%rbx
0000000000636ae9	popq	%r12
0000000000636aeb	popq	%r14
0000000000636aed	popq	%r15
0000000000636aef	popq	%rbp
0000000000636af0	retq
0000000000636af1	movq	%rax, %r14
0000000000636af4	movq	%rbx, %rdi
0000000000636af7	callq	__ZN11OZHGUserJobD2Ev           ## OZHGUserJob::~OZHGUserJob()
0000000000636afc	movq	%r14, %rdi
0000000000636aff	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000636b04	nopw	%cs:(%rax,%rax)
__ZN20OZHGAudioPrefetchJobC1ERK6CMTimeP7OZScenej:
0000000000636b10	pushq	%rbp
0000000000636b11	movq	%rsp, %rbp
0000000000636b14	pushq	%r15
0000000000636b16	pushq	%r14
0000000000636b18	pushq	%r12
0000000000636b1a	pushq	%rbx
0000000000636b1b	movl	%ecx, %r14d
0000000000636b1e	movq	%rdx, %r15
0000000000636b21	movq	%rsi, %r12
0000000000636b24	movq	%rdi, %rbx
0000000000636b27	callq	__ZN11OZHGUserJobC2Ev           ## OZHGUserJob::OZHGUserJob()
0000000000636b2c	leaq	0x251905(%rip), %rax
0000000000636b33	movq	%rax, (%rbx)
0000000000636b36	movups	(%r12), %xmm0
0000000000636b3b	movups	%xmm0, 0x90(%rbx)
0000000000636b42	movq	0x10(%r12), %rax
0000000000636b47	movq	%rax, 0xa0(%rbx)
0000000000636b4e	movq	%r15, 0xa8(%rbx)
0000000000636b55	movl	%r14d, 0xb0(%rbx)
0000000000636b5c	callq	0x6de0b8                        ## symbol stub for: __ZN15PGHGRenderQueue18getPrefetchQueueIDEv
0000000000636b61	movq	%rbx, %rdi
0000000000636b64	movl	%eax, %esi
0000000000636b66	callq	0x6df228                        ## symbol stub for: __ZN9HGUserJob10SetQueueIDEj
0000000000636b6b	movq	%rbx, %rdi
0000000000636b6e	movl	$0xa, %esi
0000000000636b73	callq	0x6df22e                        ## symbol stub for: __ZN9HGUserJob11SetPriorityENS_8PriorityE
0000000000636b78	popq	%rbx
0000000000636b79	popq	%r12
0000000000636b7b	popq	%r14
0000000000636b7d	popq	%r15
0000000000636b7f	popq	%rbp
0000000000636b80	retq
0000000000636b81	movq	%rax, %r14
0000000000636b84	movq	%rbx, %rdi
0000000000636b87	callq	__ZN11OZHGUserJobD2Ev           ## OZHGUserJob::~OZHGUserJob()
0000000000636b8c	movq	%r14, %rdi
0000000000636b8f	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000636b94	nopw	%cs:(%rax,%rax)
__ZN20OZHGAudioPrefetchJob9executingEv:
0000000000636ba0	pushq	%rbp
0000000000636ba1	movq	%rsp, %rbp
0000000000636ba4	pushq	%rbx
0000000000636ba5	pushq	%rax
0000000000636ba6	movq	%rdi, %rbx
0000000000636ba9	leaq	-0x10(%rbp), %rdi
0000000000636bad	callq	0x6de2c8                        ## symbol stub for: __ZN17PCAutoreleasePoolC1Ev
0000000000636bb2	movq	0xa8(%rbx), %rdi
0000000000636bb9	movq	%rbx, %rsi
0000000000636bbc	callq	__ZN7OZScene13prefetchAudioEP20OZHGAudioPrefetchJob ## OZScene::prefetchAudio(OZHGAudioPrefetchJob*)
0000000000636bc1	leaq	-0x10(%rbp), %rdi
0000000000636bc5	callq	0x6de2ce                        ## symbol stub for: __ZN17PCAutoreleasePoolD1Ev
0000000000636bca	addq	$0x8, %rsp
0000000000636bce	popq	%rbx
0000000000636bcf	popq	%rbp
0000000000636bd0	retq
0000000000636bd1	movq	%rax, %rbx
0000000000636bd4	leaq	-0x10(%rbp), %rdi
0000000000636bd8	callq	0x6de2ce                        ## symbol stub for: __ZN17PCAutoreleasePoolD1Ev
0000000000636bdd	movq	%rbx, %rdi
0000000000636be0	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000636be5	nopw	%cs:(%rax,%rax)
__ZN20OZHGAudioPrefetchJob8canceledEv:
0000000000636bf0	pushq	%rbp
0000000000636bf1	movq	%rsp, %rbp
0000000000636bf4	movq	%rdi, %rdx
0000000000636bf7	movq	0x80(%rdi), %rdi
0000000000636bfe	movq	0x2e0853(%rip), %rsi
0000000000636c05	popq	%rbp
0000000000636c06	jmpq	*0x1ef41c(%rip)                 ## Objc message: -[%rdi updateMasterTracksArray]
0000000000636c0c	nopl	(%rax)
__ZN20OZHGAudioPrefetchJobD1Ev:
0000000000636c10	pushq	%rbp
0000000000636c11	movq	%rsp, %rbp
0000000000636c14	popq	%rbp
0000000000636c15	jmp	__ZN11OZHGUserJobD2Ev           ## OZHGUserJob::~OZHGUserJob()
0000000000636c1a	nopw	(%rax,%rax)
__ZN20OZHGAudioPrefetchJobD0Ev:
0000000000636c20	pushq	%rbp
0000000000636c21	movq	%rsp, %rbp
0000000000636c24	pushq	%rbx
0000000000636c25	pushq	%rax
0000000000636c26	movq	%rdi, %rbx
0000000000636c29	callq	__ZN11OZHGUserJobD2Ev           ## OZHGUserJob::~OZHGUserJob()
0000000000636c2e	movq	%rbx, %rdi
0000000000636c31	addq	$0x8, %rsp
0000000000636c35	popq	%rbx
0000000000636c36	popq	%rbp
0000000000636c37	jmp	0x6def6a                        ## symbol stub for: __ZN8HGObjectdlEPv
0000000000636c3c	addb	%al, (%rax)
0000000000636c3e	addb	%al, (%rax)
__ZN24OZHGChannelEvaluationJobC2EPU28objcproto17OZHGUserJobClient11objc_objectRK6CMTime:
0000000000636c40	pushq	%rbp
0000000000636c41	movq	%rsp, %rbp
0000000000636c44	pushq	%r15
0000000000636c46	pushq	%r14
0000000000636c48	pushq	%rbx
0000000000636c49	pushq	%rax
0000000000636c4a	movq	%rdx, %r15
0000000000636c4d	movq	%rdi, %rbx
0000000000636c50	callq	__ZN11OZHGUserJobC2EPU28objcproto17OZHGUserJobClient11objc_object ## OZHGUserJob::OZHGUserJob(id<OZHGUserJobClient>)
0000000000636c55	leaq	0x251844(%rip), %rax
0000000000636c5c	movq	%rax, (%rbx)
0000000000636c5f	leaq	0x90(%rbx), %r14
0000000000636c66	movq	%r14, 0x90(%rbx)
0000000000636c6d	movq	%r14, 0x98(%rbx)
0000000000636c74	movq	$0x0, 0xa0(%rbx)
0000000000636c7f	movups	(%r15), %xmm0
0000000000636c83	movups	%xmm0, 0xa8(%rbx)
0000000000636c8a	movq	0x10(%r15), %rax
0000000000636c8e	movq	%rax, 0xb8(%rbx)
