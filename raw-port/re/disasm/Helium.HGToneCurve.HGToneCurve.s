__ZN11HGToneCurveC1Ev:
0000000000248010	pushq	%rbp
0000000000248011	movq	%rsp, %rbp
0000000000248014	pushq	%r14
0000000000248016	pushq	%rbx
0000000000248017	movq	%rdi, %rbx
000000000024801a	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
000000000024801f	leaq	0x7eef7a(%rip), %rax
0000000000248026	movq	%rax, (%rbx)
0000000000248029	movl	$0xfffff9ff, %eax               ## imm = 0xFFFFF9FF
000000000024802e	andl	0x10(%rbx), %eax
0000000000248031	orl	$0x400, %eax                    ## imm = 0x400
0000000000248036	movl	%eax, 0x10(%rbx)
0000000000248039	movq	$0x0, 0x198(%rbx)
0000000000248044	movb	$0x1, 0x1a0(%rbx)
000000000024804b	movsd	0x18205d(%rip), %xmm0
0000000000248053	movsd	%xmm0, 0x1b8(%rbx)
000000000024805b	movl	$0x0, 0x1a8(%rbx)
0000000000248065	xorps	%xmm0, %xmm0
0000000000248068	movaps	%xmm0, 0x1c0(%rbx)
000000000024806f	movl	$0x0, 0x1d0(%rbx)
0000000000248079	movl	$0x1d47, %edi                   ## imm = 0x1D47
000000000024807e	callq	0x3c4fac                        ## symbol stub for: __Znam
0000000000248083	leaq	0x8(%rax), %rcx
0000000000248087	negl	%ecx
0000000000248089	andl	$0x1f, %ecx
000000000024808c	leaq	(%rcx,%rax), %r14
0000000000248090	addq	$0x8, %r14
0000000000248094	movq	%rax, (%rcx,%rax)
0000000000248098	movq	%r14, %rdi
000000000024809b	callq	__ZN11HGToneCurve5StateC2Ev     ## HGToneCurve::State::State()
00000000002480a0	movq	%r14, 0x1b0(%rbx)
00000000002480a7	popq	%rbx
00000000002480a8	popq	%r14
00000000002480aa	popq	%rbp
00000000002480ab	retq
00000000002480ac	movq	%rax, %r14
00000000002480af	movq	%rbx, %rdi
00000000002480b2	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000002480b7	movq	%r14, %rdi
00000000002480ba	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000002480bf	nop
