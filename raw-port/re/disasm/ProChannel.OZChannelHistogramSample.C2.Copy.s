__ZN24OZChannelHistogramSampleC2ERKS_P15OZChannelFolder:
0000000000071646	pushq	%rbp
0000000000071647	movq	%rsp, %rbp
000000000007164a	pushq	%r15
000000000007164c	pushq	%r14
000000000007164e	pushq	%r13
0000000000071650	pushq	%r12
0000000000071652	pushq	%rbx
0000000000071653	subq	$0x18, %rsp
0000000000071657	movq	%rsi, %r12
000000000007165a	movq	%rdi, %rbx
000000000007165d	callq	__ZN17OZCompoundChannelC2ERKS_P15OZChannelFolder ## OZCompoundChannel::OZCompoundChannel(OZCompoundChannel const&, OZChannelFolder*)
0000000000071662	leaq	0x6b1e7(%rip), %rax
0000000000071669	movq	%rax, (%rbx)
000000000007166c	leaq	0x6b515(%rip), %rax
0000000000071673	movq	%rax, 0x10(%rbx)
0000000000071677	movl	$0x88, %esi
000000000007167c	leaq	(%rbx,%rsi), %r14
0000000000071680	addq	%r12, %rsi
0000000000071683	movq	%r14, %rdi
0000000000071686	movq	%rbx, %rdx
0000000000071689	callq	__ZN9OZChannelC2ERKS_P15OZChannelFolder ## OZChannel::OZChannel(OZChannel const&, OZChannelFolder*)
000000000007168e	leaq	__ZTV15OZChannelDouble(%rip), %r15 ## vtable for OZChannelDouble
0000000000071695	leaq	0x10(%r15), %r13
0000000000071699	movq	%r13, 0x88(%rbx)
00000000000716a0	addq	$0x370, %r15                    ## imm = 0x370
00000000000716a7	movq	%r15, 0x98(%rbx)
00000000000716ae	movl	$0x120, %esi                    ## imm = 0x120
00000000000716b3	leaq	(%rbx,%rsi), %rdi
00000000000716b7	addq	%r12, %rsi
00000000000716ba	movq	%rdi, -0x38(%rbp)
00000000000716be	movq	%rbx, %rdx
00000000000716c1	movq	%r14, -0x40(%rbp)
00000000000716c5	callq	__ZN9OZChannelC2ERKS_P15OZChannelFolder ## OZChannel::OZChannel(OZChannel const&, OZChannelFolder*)
00000000000716ca	movq	%r13, 0x120(%rbx)
00000000000716d1	movq	%r15, 0x130(%rbx)
00000000000716d8	movl	$0x1b8, %esi                    ## imm = 0x1B8
00000000000716dd	leaq	(%rbx,%rsi), %rdi
00000000000716e1	addq	%r12, %rsi
00000000000716e4	movq	%rdi, -0x30(%rbp)
00000000000716e8	movq	%rbx, %rdx
00000000000716eb	callq	__ZN9OZChannelC2ERKS_P15OZChannelFolder ## OZChannel::OZChannel(OZChannel const&, OZChannelFolder*)
00000000000716f0	movq	%r13, 0x1b8(%rbx)
00000000000716f7	movq	%r15, 0x1c8(%rbx)
00000000000716fe	movl	$0x250, %esi                    ## imm = 0x250
0000000000071703	leaq	(%rbx,%rsi), %r14
0000000000071707	addq	%r12, %rsi
000000000007170a	movq	%r14, %rdi
000000000007170d	movq	%rbx, %rdx
0000000000071710	callq	__ZN9OZChannelC2ERKS_P15OZChannelFolder ## OZChannel::OZChannel(OZChannel const&, OZChannelFolder*)
0000000000071715	movq	%r13, 0x250(%rbx)
000000000007171c	movq	%r15, 0x260(%rbx)
0000000000071723	movl	$0x2e8, %eax                    ## imm = 0x2E8
0000000000071728	leaq	(%rbx,%rax), %rdi
000000000007172c	addq	%rax, %r12
000000000007172f	movq	%r12, %rsi
0000000000071732	movq	%rbx, %rdx
0000000000071735	callq	__ZN9OZChannelC2ERKS_P15OZChannelFolder ## OZChannel::OZChannel(OZChannel const&, OZChannelFolder*)
000000000007173a	movq	%r13, 0x2e8(%rbx)
0000000000071741	movq	%r15, 0x2f8(%rbx)
0000000000071748	addq	$0x18, %rsp
000000000007174c	popq	%rbx
000000000007174d	popq	%r12
000000000007174f	popq	%r13
0000000000071751	popq	%r14
0000000000071753	popq	%r15
0000000000071755	popq	%rbp
0000000000071756	retq
0000000000071757	movq	%rax, %r12
000000000007175a	movq	%r14, %rdi
000000000007175d	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
0000000000071762	jmp	0x71767
0000000000071764	movq	%rax, %r12
0000000000071767	movq	-0x30(%rbp), %rdi
000000000007176b	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
0000000000071770	jmp	0x71775
0000000000071772	movq	%rax, %r12
0000000000071775	movq	-0x38(%rbp), %rdi
0000000000071779	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
000000000007177e	jmp	0x71783
0000000000071780	movq	%rax, %r12
0000000000071783	movq	-0x40(%rbp), %rdi
0000000000071787	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
000000000007178c	jmp	0x71791
000000000007178e	movq	%rax, %r12
0000000000071791	movq	%rbx, %rdi
0000000000071794	callq	__ZN17OZCompoundChannelD2Ev     ## OZCompoundChannel::~OZCompoundChannel()
0000000000071799	movq	%r12, %rdi
000000000007179c	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
00000000000717a1	nop
