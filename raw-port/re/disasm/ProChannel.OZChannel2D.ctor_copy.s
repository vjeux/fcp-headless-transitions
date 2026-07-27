__ZN11OZChannel2DC2ERKS_P15OZChannelFolder:
0000000000047856	pushq	%rbp
0000000000047857	movq	%rsp, %rbp
000000000004785a	pushq	%r15
000000000004785c	pushq	%r14
000000000004785e	pushq	%r13
0000000000047860	pushq	%r12
0000000000047862	pushq	%rbx
0000000000047863	pushq	%rax
0000000000047864	movq	%rsi, %r14
0000000000047867	movq	%rdi, %rbx
000000000004786a	callq	__ZN17OZCompoundChannelC2ERKS_P15OZChannelFolder ## OZCompoundChannel::OZCompoundChannel(OZCompoundChannel const&, OZChannelFolder*)
000000000004786f	leaq	0x8ef12(%rip), %rax
0000000000047876	movq	%rax, (%rbx)
0000000000047879	leaq	0x8f250(%rip), %rax
0000000000047880	movq	%rax, 0x10(%rbx)
0000000000047884	movl	$0x88, %esi
0000000000047889	leaq	(%rbx,%rsi), %r15
000000000004788d	addq	%r14, %rsi
0000000000047890	movq	%r15, %rdi
0000000000047893	movq	%rbx, %rdx
0000000000047896	callq	__ZN9OZChannelC2ERKS_P15OZChannelFolder ## OZChannel::OZChannel(OZChannel const&, OZChannelFolder*)
000000000004789b	leaq	__ZTV15OZChannelDouble(%rip), %r12 ## vtable for OZChannelDouble
00000000000478a2	leaq	0x10(%r12), %r13
00000000000478a7	movq	%r13, 0x88(%rbx)
00000000000478ae	addq	$0x370, %r12                    ## imm = 0x370
00000000000478b5	movq	%r12, 0x98(%rbx)
00000000000478bc	movl	$0x120, %eax                    ## imm = 0x120
00000000000478c1	leaq	(%rbx,%rax), %rdi
00000000000478c5	addq	%rax, %r14
00000000000478c8	movq	%r14, %rsi
00000000000478cb	movq	%rbx, %rdx
00000000000478ce	callq	__ZN9OZChannelC2ERKS_P15OZChannelFolder ## OZChannel::OZChannel(OZChannel const&, OZChannelFolder*)
00000000000478d3	movq	%r13, 0x120(%rbx)
00000000000478da	movq	%r12, 0x130(%rbx)
00000000000478e1	addq	$0x8, %rsp
00000000000478e5	popq	%rbx
00000000000478e6	popq	%r12
00000000000478e8	popq	%r13
00000000000478ea	popq	%r14
00000000000478ec	popq	%r15
00000000000478ee	popq	%rbp
00000000000478ef	retq
00000000000478f0	movq	%rax, %r14
00000000000478f3	movq	%r15, %rdi
00000000000478f6	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
00000000000478fb	jmp	0x47900
00000000000478fd	movq	%rax, %r14
0000000000047900	movq	%rbx, %rdi
0000000000047903	callq	__ZN17OZCompoundChannelD2Ev     ## OZCompoundChannel::~OZCompoundChannel()
0000000000047908	movq	%r14, %rdi
000000000004790b	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
