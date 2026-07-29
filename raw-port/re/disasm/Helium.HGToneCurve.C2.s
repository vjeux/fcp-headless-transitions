__ZN11HGToneCurveC2Ev:
0000000000247f60	pushq	%rbp
0000000000247f61	movq	%rsp, %rbp
0000000000247f64	pushq	%r14
0000000000247f66	pushq	%rbx
0000000000247f67	movq	%rdi, %rbx
0000000000247f6a	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
0000000000247f6f	leaq	0x7ef02a(%rip), %rax
0000000000247f76	movq	%rax, (%rbx)
0000000000247f79	movl	$0xfffff9ff, %eax               ## imm = 0xFFFFF9FF
0000000000247f7e	andl	0x10(%rbx), %eax
0000000000247f81	orl	$0x400, %eax                    ## imm = 0x400
0000000000247f86	movl	%eax, 0x10(%rbx)
0000000000247f89	movq	$0x0, 0x198(%rbx)
0000000000247f94	movb	$0x1, 0x1a0(%rbx)
0000000000247f9b	movsd	0x18210d(%rip), %xmm0
0000000000247fa3	movsd	%xmm0, 0x1b8(%rbx)
0000000000247fab	movl	$0x0, 0x1a8(%rbx)
0000000000247fb5	xorps	%xmm0, %xmm0
0000000000247fb8	movaps	%xmm0, 0x1c0(%rbx)
0000000000247fbf	movl	$0x0, 0x1d0(%rbx)
0000000000247fc9	movl	$0x1d47, %edi                   ## imm = 0x1D47
0000000000247fce	callq	0x3c4fac                        ## symbol stub for: __Znam
0000000000247fd3	leaq	0x8(%rax), %rcx
0000000000247fd7	negl	%ecx
0000000000247fd9	andl	$0x1f, %ecx
0000000000247fdc	leaq	(%rcx,%rax), %r14
0000000000247fe0	addq	$0x8, %r14
0000000000247fe4	movq	%rax, (%rcx,%rax)
0000000000247fe8	movq	%r14, %rdi
0000000000247feb	callq	__ZN11HGToneCurve5StateC2Ev     ## HGToneCurve::State::State()
0000000000247ff0	movq	%r14, 0x1b0(%rbx)
0000000000247ff7	popq	%rbx
0000000000247ff8	popq	%r14
0000000000247ffa	popq	%rbp
0000000000247ffb	retq
0000000000247ffc	movq	%rax, %r14
0000000000247fff	movq	%rbx, %rdi
0000000000248002	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000248007	movq	%r14, %rdi
000000000024800a	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000024800f	nop
