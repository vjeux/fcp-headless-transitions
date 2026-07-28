__ZN18OZSimpleCameraUndo4SwapEv:
0000000000106390	pushq	%rbp
0000000000106391	movq	%rsp, %rbp
0000000000106394	pushq	%r15
0000000000106396	pushq	%r14
0000000000106398	pushq	%r13
000000000010639a	pushq	%r12
000000000010639c	pushq	%rbx
000000000010639d	subq	$0xf8, %rsp
00000000001063a4	movq	0x72008d(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
00000000001063ab	movq	(%rax), %rax
00000000001063ae	movq	%rax, -0x30(%rbp)
00000000001063b2	movq	0x220(%rdi), %rax
00000000001063b9	testq	%rax, %rax
00000000001063bc	je	0x10665e
00000000001063c2	movq	%rdi, %r14
00000000001063c5	movq	0xa0(%rax), %rdi
00000000001063cc	testq	%rdi, %rdi
00000000001063cf	je	0x10665e
00000000001063d5	movq	0x803c14(%rip), %rsi
00000000001063dc	movq	0x71fc45(%rip), %rbx            ## Objc message: -[%rdi getCurrentTool]
00000000001063e3	callq	*%rbx
00000000001063e5	movq	0x802f84(%rip), %rsi
00000000001063ec	movq	%rax, %rdi
00000000001063ef	callq	*%rbx
00000000001063f1	movq	0x802f80(%rip), %rsi
00000000001063f8	movq	%rax, %rdi
00000000001063fb	callq	*%rbx
00000000001063fd	movq	%rax, %rbx
0000000000106400	movq	0x220(%r14), %rax
0000000000106407	movslq	0x228(%r14), %rcx
000000000010640e	movq	0xb0(%rax,%rcx,8), %rcx
0000000000106416	movq	0x60(%rcx), %rax
000000000010641a	movq	%rax, -0xc0(%rbp)
0000000000106421	leaq	-0xb8(%rbp), %r12
0000000000106428	movq	%rcx, -0xe0(%rbp)
000000000010642f	leaq	0x68(%rcx), %rsi
0000000000106433	movq	%r12, %rdi
0000000000106436	callq	0x6ddae2                        ## symbol stub for: __ZN13PCSharedCountC1ERKS_
000000000010643b	leaq	-0xd0(%rbp), %rdi
0000000000106442	leaq	-0xc0(%rbp), %rsi
0000000000106449	callq	__ZN5PCPtrI14LiSimpleCameraEC2I8LiCameraEERKS_IT_E18__dynamic_cast_tag ## PCPtr<LiSimpleCamera>::PCPtr<LiCamera>(PCPtr<LiCamera> const&, __dynamic_cast_tag)
000000000010644e	movq	%r12, %rdi
0000000000106451	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
0000000000106456	movq	-0xe0(%rbp), %rax
000000000010645d	movl	0xf0(%rax), %eax
0000000000106463	cmpl	0x22c(%r14), %eax
000000000010646a	jne	0x106652
0000000000106470	cmpq	$0x0, -0xd0(%rbp)
0000000000106478	je	0x106652
000000000010647e	movl	$0x218, %edi                    ## imm = 0x218
0000000000106483	callq	0x6dfca2                        ## symbol stub for: __Znwm
0000000000106488	movq	%rax, %r12
000000000010648b	movq	%rax, %rdi
000000000010648e	callq	0x6ddc5c                        ## symbol stub for: __ZN14LiSimpleCameraC1Ev
0000000000106493	movq	%r12, -0xc0(%rbp)
000000000010649a	movq	(%r12), %rax
000000000010649e	addq	-0x18(%rax), %r12
00000000001064a2	leaq	-0xb8(%rbp), %rdi
00000000001064a9	movq	%r12, %rsi
00000000001064ac	callq	0x6ddadc                        ## symbol stub for: __ZN13PCSharedCountC1EP13PCShared_base
00000000001064b1	movq	-0xc0(%rbp), %rdi
00000000001064b8	testq	%rdi, %rdi
00000000001064bb	jne	0x1064ce
00000000001064bd	movl	$0x1, %edi
00000000001064c2	callq	0x6dd290                        ## symbol stub for: __Z28throw_PCNullPointerExceptionb
00000000001064c7	movq	-0xc0(%rbp), %rdi
00000000001064ce	movq	-0xd0(%rbp), %rsi
00000000001064d5	movq	(%rdi), %rax
00000000001064d8	callq	*0x398(%rax)
00000000001064de	movq	-0xd0(%rbp), %rdi
00000000001064e5	testq	%rdi, %rdi
00000000001064e8	jne	0x1064fb
00000000001064ea	movl	$0x1, %edi
00000000001064ef	callq	0x6dd290                        ## symbol stub for: __Z28throw_PCNullPointerExceptionb
00000000001064f4	movq	-0xd0(%rbp), %rdi
00000000001064fb	addq	$0x8, %r14
00000000001064ff	movq	(%rdi), %rax
0000000000106502	movq	%r14, %rsi
0000000000106505	callq	*0x398(%rax)
000000000010650b	movq	-0xc0(%rbp), %rsi
0000000000106512	movq	%r14, %rdi
0000000000106515	callq	0x6ddc56                        ## symbol stub for: __ZN14LiSimpleCamera3setEPK8LiCamera
000000000010651a	movq	0x8031c7(%rip), %rsi
0000000000106521	movq	%rbx, %rdi
0000000000106524	callq	*0x71fafe(%rip)                 ## Objc message: -[%rdi getCurrentTool]
000000000010652a	movq	0x802bdf(%rip), %rsi
0000000000106531	movq	%rax, %rdi
0000000000106534	callq	*0x71faee(%rip)                 ## Objc message: -[%rdi getCurrentTool]
000000000010653a	movq	%rax, %r15
000000000010653d	xorps	%xmm0, %xmm0
0000000000106540	movaps	%xmm0, -0xf0(%rbp)
0000000000106547	movaps	%xmm0, -0x100(%rbp)
000000000010654e	movaps	%xmm0, -0x110(%rbp)
0000000000106555	movaps	%xmm0, -0x120(%rbp)
000000000010655c	movq	0x802c65(%rip), %rsi
0000000000106563	leaq	-0x120(%rbp), %rdx
000000000010656a	leaq	-0xb0(%rbp), %rcx
0000000000106571	movl	$0x10, %r8d
0000000000106577	movq	%rax, %rdi
000000000010657a	callq	*0x71faa8(%rip)                 ## Objc message: -[%rdi getCurrentTool]
0000000000106580	movq	%rax, %rbx
0000000000106583	testq	%rax, %rax
0000000000106586	je	0x106646
000000000010658c	movq	-0x110(%rbp), %rax
0000000000106593	movq	(%rax), %r14
0000000000106596	movq	%r15, -0xd8(%rbp)
000000000010659d	movq	0x802ab4(%rip), %r12
00000000001065a4	xorl	%r15d, %r15d
00000000001065a7	nopw	(%rax,%rax)
00000000001065b0	movq	-0x110(%rbp), %rax
00000000001065b7	cmpq	%r14, (%rax)
00000000001065ba	je	0x1065c8
00000000001065bc	movq	-0xd8(%rbp), %rdi
00000000001065c3	callq	0x6dffe4                        ## symbol stub for: _objc_enumerationMutation
00000000001065c8	movq	-0x118(%rbp), %rax
00000000001065cf	movq	(%rax,%r15,8), %r13
00000000001065d3	movq	%r13, %rdi
00000000001065d6	movq	%r12, %rsi
00000000001065d9	callq	*0x71fa49(%rip)                 ## Objc message: -[%rdi getCurrentTool]
00000000001065df	cmpq	-0xe0(%rbp), %rax
00000000001065e6	je	0x106626
00000000001065e8	incq	%r15
00000000001065eb	cmpq	%r15, %rbx
00000000001065ee	jne	0x1065b0
00000000001065f0	movl	$0x10, %r8d
00000000001065f6	movq	-0xd8(%rbp), %rdi
00000000001065fd	movq	0x802bc4(%rip), %rsi
0000000000106604	leaq	-0x120(%rbp), %rdx
000000000010660b	leaq	-0xb0(%rbp), %rcx
0000000000106612	callq	*0x71fa10(%rip)                 ## Objc message: -[%rdi getCurrentTool]
0000000000106618	movq	%rax, %rbx
000000000010661b	testq	%rax, %rax
000000000010661e	jne	0x10659d
0000000000106624	jmp	0x106646
0000000000106626	movq	0x8029a3(%rip), %rsi
000000000010662d	movq	%r13, %rdi
0000000000106630	callq	*0x71f9f2(%rip)                 ## Objc message: -[%rdi getCurrentTool]
0000000000106636	movq	0x80299b(%rip), %rsi
000000000010663d	movq	%r13, %rdi
0000000000106640	callq	*0x71f9e2(%rip)                 ## Objc message: -[%rdi getCurrentTool]
0000000000106646	leaq	-0xb8(%rbp), %rdi
000000000010664d	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
0000000000106652	leaq	-0xc8(%rbp), %rdi
0000000000106659	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000010665e	movq	0x71fdd3(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
0000000000106665	movq	(%rax), %rax
0000000000106668	cmpq	-0x30(%rbp), %rax
000000000010666c	jne	0x106680
000000000010666e	addq	$0xf8, %rsp
0000000000106675	popq	%rbx
0000000000106676	popq	%r12
0000000000106678	popq	%r13
000000000010667a	popq	%r14
000000000010667c	popq	%r15
000000000010667e	popq	%rbp
000000000010667f	retq
0000000000106680	callq	0x6dfd38                        ## symbol stub for: ___stack_chk_fail
0000000000106685	jmp	0x1066de
0000000000106687	movq	%rax, %rbx
000000000010668a	movq	%r12, %rdi
000000000010668d	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
0000000000106692	leaq	-0xc8(%rbp), %rdi
0000000000106699	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
000000000010669e	movq	%rbx, %rdi
00000000001066a1	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000001066a6	jmp	0x1066de
00000000001066a8	movq	%rax, %rbx
00000000001066ab	leaq	-0xc8(%rbp), %rdi
00000000001066b2	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001066b7	movq	%rbx, %rdi
00000000001066ba	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000001066bf	movq	%rax, %rbx
00000000001066c2	movq	%r12, %rdi
00000000001066c5	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001066ca	movq	%rbx, %rdi
00000000001066cd	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000001066d2	movq	%rax, %rdi
00000000001066d5	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000001066da	jmp	0x1066de
00000000001066dc	jmp	0x1066de
00000000001066de	movq	%rax, %rbx
00000000001066e1	leaq	-0xb8(%rbp), %rdi
00000000001066e8	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001066ed	leaq	-0xc8(%rbp), %rdi
00000000001066f4	callq	0x6ddaee                        ## symbol stub for: __ZN13PCSharedCountD1Ev
00000000001066f9	movq	%rbx, %rdi
00000000001066fc	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000106701	nopw	%cs:(%rax,%rax)
