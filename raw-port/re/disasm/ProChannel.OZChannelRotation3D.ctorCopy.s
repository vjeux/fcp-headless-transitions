__ZN19OZChannelRotation3DC2ERKS_P15OZChannelFolder:
0000000000081372	pushq	%rbp
0000000000081373	movq	%rsp, %rbp
0000000000081376	pushq	%r15
0000000000081378	pushq	%r14
000000000008137a	pushq	%r13
000000000008137c	pushq	%r12
000000000008137e	pushq	%rbx
000000000008137f	subq	$0x18, %rsp
0000000000081383	movq	%rsi, %r12
0000000000081386	movq	%rdi, %rbx
0000000000081389	callq	__ZN17OZCompoundChannelC2ERKS_P15OZChannelFolder ## OZCompoundChannel::OZCompoundChannel(OZCompoundChannel const&, OZChannelFolder*)
000000000008138e	leaq	0x5d09b(%rip), %rax
0000000000081395	movq	%rax, (%rbx)
0000000000081398	leaq	0x5d3d1(%rip), %rax
000000000008139f	movq	%rax, 0x10(%rbx)
00000000000813a3	movl	$0x88, %esi
00000000000813a8	leaq	(%rbx,%rsi), %r14
00000000000813ac	addq	%r12, %rsi
00000000000813af	movq	%r14, %rdi
00000000000813b2	movq	%rbx, %rdx
00000000000813b5	callq	__ZN9OZChannelC2ERKS_P15OZChannelFolder ## OZChannel::OZChannel(OZChannel const&, OZChannelFolder*)
00000000000813ba	movq	%r14, -0x38(%rbp)
00000000000813be	leaq	__ZTV14OZChannelAngle(%rip), %r14 ## vtable for OZChannelAngle
00000000000813c5	leaq	0x10(%r14), %r15
00000000000813c9	movq	%r15, 0x88(%rbx)
00000000000813d0	addq	$0x370, %r14                    ## imm = 0x370
00000000000813d7	movq	%r14, 0x98(%rbx)
00000000000813de	movl	$0x120, %esi                    ## imm = 0x120
00000000000813e3	leaq	(%rbx,%rsi), %rdi
00000000000813e7	addq	%r12, %rsi
00000000000813ea	movq	%rdi, -0x30(%rbp)
00000000000813ee	movq	%rbx, %rdx
00000000000813f1	callq	__ZN9OZChannelC2ERKS_P15OZChannelFolder ## OZChannel::OZChannel(OZChannel const&, OZChannelFolder*)
00000000000813f6	movq	%r15, 0x120(%rbx)
00000000000813fd	movq	%r14, 0x130(%rbx)
0000000000081404	movl	$0x1b8, %esi                    ## imm = 0x1B8
0000000000081409	leaq	(%rbx,%rsi), %r13
000000000008140d	addq	%r12, %rsi
0000000000081410	movq	%r13, %rdi
0000000000081413	movq	%rbx, %rdx
0000000000081416	callq	__ZN9OZChannelC2ERKS_P15OZChannelFolder ## OZChannel::OZChannel(OZChannel const&, OZChannelFolder*)
000000000008141b	movq	%r15, 0x1b8(%rbx)
0000000000081422	movq	%r14, 0x1c8(%rbx)
0000000000081429	movl	$0x250, %eax                    ## imm = 0x250
000000000008142e	leaq	(%rbx,%rax), %r14
0000000000081432	addq	%rax, %r12
0000000000081435	movq	%r14, %rdi
0000000000081438	movq	%r12, %rsi
000000000008143b	movq	%rbx, %rdx
000000000008143e	callq	__ZN13OZChannelEnumC2ERKS_P15OZChannelFolder ## OZChannelEnum::OZChannelEnum(OZChannelEnum const&, OZChannelFolder*)
0000000000081443	leaq	0x5d396(%rip), %rax
000000000008144a	movq	%rax, 0x250(%rbx)
0000000000081451	leaq	0x5d6f8(%rip), %rax
0000000000081458	movq	%rax, 0x260(%rbx)
000000000008145f	leaq	0x350(%rbx), %r12
0000000000081466	movl	$0x0, 0x350(%rbx)
0000000000081470	movq	%rbx, %rdi
0000000000081473	callq	__ZN19OZChannelRotation3D22initCustomInterpolatorEv ## OZChannelRotation3D::initCustomInterpolator()
0000000000081478	addq	$0x18, %rsp
000000000008147c	popq	%rbx
000000000008147d	popq	%r12
000000000008147f	popq	%r13
0000000000081481	popq	%r14
0000000000081483	popq	%r15
0000000000081485	popq	%rbp
0000000000081486	retq
0000000000081487	movq	%rax, %r15
000000000008148a	movq	%r12, %rdi
000000000008148d	callq	0xacb22                         ## symbol stub for: __ZN10PCSpinLockD1Ev
0000000000081492	movq	%r14, %rdi
0000000000081495	callq	__ZN13OZChannelEnumD2Ev         ## OZChannelEnum::~OZChannelEnum()
000000000008149a	jmp	0x8149f
000000000008149c	movq	%rax, %r15
000000000008149f	movq	%r13, %rdi
00000000000814a2	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
00000000000814a7	jmp	0x814ac
00000000000814a9	movq	%rax, %r15
00000000000814ac	movq	-0x30(%rbp), %rdi
00000000000814b0	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
00000000000814b5	jmp	0x814ba
00000000000814b7	movq	%rax, %r15
00000000000814ba	movq	-0x38(%rbp), %rdi
00000000000814be	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
00000000000814c3	jmp	0x814c8
00000000000814c5	movq	%rax, %r15
00000000000814c8	movq	%rbx, %rdi
00000000000814cb	callq	__ZN17OZCompoundChannelD2Ev     ## OZCompoundChannel::~OZCompoundChannel()
00000000000814d0	movq	%r15, %rdi
00000000000814d3	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
