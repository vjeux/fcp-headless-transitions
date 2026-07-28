00000000006365df	addb	%dl, 0x48(%rbp)
00000000006365e2	movl	%esp, %ebp
00000000006365e4	pushq	%r15
00000000006365e6	pushq	%r14
00000000006365e8	pushq	%r13
00000000006365ea	pushq	%r12
00000000006365ec	pushq	%rbx
00000000006365ed	pushq	%rax
00000000006365ee	movsd	%xmm0, -0x30(%rbp)
00000000006365f3	movq	%r9, %r14
00000000006365f6	movl	%r8d, %r15d
00000000006365f9	movl	%ecx, %r12d
00000000006365fc	movq	%rdx, %r13
00000000006365ff	movq	%rdi, %rbx
0000000000636602	callq	__ZN11OZHGUserJobC2EPU28objcproto17OZHGUserJobClient11objc_object ## OZHGUserJob::OZHGUserJob(id<OZHGUserJobClient>)
0000000000636607	leaq	0x251dc2(%rip), %rax
000000000063660e	movq	%rax, (%rbx)
0000000000636611	movq	%r13, 0x90(%rbx)
0000000000636618	movl	%r12d, 0x98(%rbx)
000000000063661f	movl	%r15d, 0x9c(%rbx)
0000000000636626	movq	%r14, 0xa0(%rbx)
000000000063662d	movq	0x10(%rbp), %rcx
0000000000636631	movq	0x10(%rcx), %rax
0000000000636635	movq	%rax, 0xb8(%rbx)
000000000063663c	movups	(%rcx), %xmm0
000000000063663f	movups	%xmm0, 0xa8(%rbx)
0000000000636646	movq	0x18(%rbp), %rax
000000000063664a	movups	(%rax), %xmm0
000000000063664d	movups	%xmm0, 0xc0(%rbx)
0000000000636654	movq	0x10(%rax), %rax
0000000000636658	movq	%rax, 0xd0(%rbx)
000000000063665f	movq	0x20(%rbp), %rcx
0000000000636663	movq	0x10(%rcx), %rax
0000000000636667	movq	%rax, 0xe8(%rbx)
000000000063666e	movups	(%rcx), %xmm0
0000000000636671	movups	%xmm0, 0xd8(%rbx)
0000000000636678	movl	0x28(%rbp), %eax
000000000063667b	movl	%eax, 0xf0(%rbx)
0000000000636681	movsd	-0x30(%rbp), %xmm0
0000000000636686	movsd	%xmm0, 0xf8(%rbx)
000000000063668e	movl	$0x4, 0x100(%rbx)
0000000000636698	movzbl	0x30(%rbp), %eax
000000000063669c	movb	%al, 0x104(%rbx)
00000000006366a2	movq	$0x0, 0x108(%rbx)
00000000006366ad	movl	$0x20, %edi
00000000006366b2	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000006366b7	leaq	0x108(%rbx), %r14
00000000006366be	xorps	%xmm0, %xmm0
00000000006366c1	movups	%xmm0, 0x8(%rax)
00000000006366c5	leaq	__ZTVNSt3__120__shared_ptr_pointerIP13PCAudioBuffer19OZDeleteSharedAudioNS_9allocatorIS1_EEEE(%rip), %rcx ## vtable for std::__1::__shared_ptr_pointer<PCAudioBuffer*, OZDeleteSharedAudio, std::__1::allocator<PCAudioBuffer>>
00000000006366cc	addq	$0x10, %rcx
00000000006366d0	movq	%rcx, (%rax)
00000000006366d3	movq	$0x0, 0x18(%rax)
00000000006366db	movq	%rax, 0x110(%rbx)
00000000006366e2	movq	%rbx, %rdi
00000000006366e5	xorl	%esi, %esi
00000000006366e7	callq	0x6df22e                        ## symbol stub for: __ZN9HGUserJob11SetPriorityENS_8PriorityE
00000000006366ec	callq	0x6de0a0                        ## symbol stub for: __ZN15PGHGRenderQueue15getAudioQueueIDEv
00000000006366f1	movq	%rbx, %rdi
00000000006366f4	movl	%eax, %esi
00000000006366f6	callq	0x6df228                        ## symbol stub for: __ZN9HGUserJob10SetQueueIDEj
00000000006366fb	addq	$0x8, %rsp
00000000006366ff	popq	%rbx
0000000000636700	popq	%r12
0000000000636702	popq	%r13
0000000000636704	popq	%r14
0000000000636706	popq	%r15
0000000000636708	popq	%rbp
0000000000636709	retq
000000000063670a	movq	%rax, %rdi
000000000063670d	callq	0x6dfcd8                        ## symbol stub for: ___cxa_begin_catch
0000000000636712	callq	0x6dfd02                        ## symbol stub for: ___cxa_rethrow
0000000000636717	ud2
0000000000636719	movq	%rax, %r15
000000000063671c	callq	0x6dfcde                        ## symbol stub for: ___cxa_end_catch
0000000000636721	jmp	0x636736
0000000000636723	movq	%rax, %rdi
0000000000636726	callq	___clang_call_terminate
000000000063672b	movq	%rax, %r15
000000000063672e	movq	%r14, %rdi
0000000000636731	callq	__ZNSt3__110shared_ptrI20Li3DEngineObjectDataED1B9nqe210106Ev ## std::__1::shared_ptr<Li3DEngineObjectData>::~shared_ptr[abi:nqe210106]()
0000000000636736	movq	%rbx, %rdi
0000000000636739	callq	__ZN11OZHGUserJobD2Ev           ## OZHGUserJob::~OZHGUserJob()
000000000063673e	movq	%r15, %rdi
