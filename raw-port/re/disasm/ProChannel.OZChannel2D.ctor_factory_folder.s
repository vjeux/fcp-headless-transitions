__ZN11OZChannel2DC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo:
0000000000047050	pushq	%rbp
0000000000047051	movq	%rsp, %rbp
0000000000047054	pushq	%r15
0000000000047056	pushq	%r14
0000000000047058	pushq	%r12
000000000004705a	pushq	%rbx
000000000004705b	subq	$0x20, %rsp
000000000004705f	movq	%rdi, %rbx
0000000000047062	movl	0x10(%rbp), %eax
0000000000047065	movl	%eax, 0x8(%rsp)
0000000000047069	movl	$0x0, (%rsp)
0000000000047070	callq	__ZN17OZCompoundChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjbj ## OZCompoundChannel::OZCompoundChannel(OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int, bool, unsigned int)
0000000000047075	leaq	0x8f70c(%rip), %rax
000000000004707c	movq	%rax, (%rbx)
000000000004707f	leaq	0x8fa4a(%rip), %rax
0000000000047086	movq	%rax, 0x10(%rbx)
000000000004708a	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
000000000004708f	leaq	0x9deda(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
0000000000047096	leaq	-0x28(%rbp), %rdi
000000000004709a	movq	%rax, %rdx
000000000004709d	xorl	%ecx, %ecx
000000000004709f	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
00000000000470a4	movq	0x20(%rbp), %r12
00000000000470a8	movq	0x18(%rbp), %r15
00000000000470ac	leaq	0x88(%rbx), %r14
00000000000470b3	movq	%r12, (%rsp)
00000000000470b7	leaq	-0x28(%rbp), %rsi
00000000000470bb	movq	%r14, %rdi
00000000000470be	movq	%rbx, %rdx
00000000000470c1	movl	$0x1, %ecx
00000000000470c6	xorl	%r8d, %r8d
00000000000470c9	movq	%r15, %r9
00000000000470cc	callq	__ZN15OZChannelDoubleC2ERK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
00000000000470d1	leaq	-0x28(%rbp), %rdi
00000000000470d5	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
00000000000470da	callq	__Z19getProChannelBundlev       ## getProChannelBundle()
00000000000470df	leaq	0x9deaa(%rip), %rsi             ## Objc cfstring ref: @"bad cfstring ref"
00000000000470e6	leaq	-0x28(%rbp), %rdi
00000000000470ea	movq	%rax, %rdx
00000000000470ed	xorl	%ecx, %ecx
00000000000470ef	callq	0xacd02                         ## symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
00000000000470f4	leaq	0x120(%rbx), %rdi
00000000000470fb	movq	%r12, (%rsp)
00000000000470ff	leaq	-0x28(%rbp), %rsi
0000000000047103	movq	%rbx, %rdx
0000000000047106	movl	$0x2, %ecx
000000000004710b	xorl	%r8d, %r8d
000000000004710e	movq	%r15, %r9
0000000000047111	callq	__ZN15OZChannelDoubleC2ERK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo ## OZChannelDouble::OZChannelDouble(PCString const&, OZChannelFolder*, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
0000000000047116	leaq	-0x28(%rbp), %rdi
000000000004711a	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
000000000004711f	addq	$0x20, %rsp
0000000000047123	popq	%rbx
0000000000047124	popq	%r12
0000000000047126	popq	%r14
0000000000047128	popq	%r15
000000000004712a	popq	%rbp
000000000004712b	retq
000000000004712c	movq	%rax, %r15
000000000004712f	leaq	-0x28(%rbp), %rdi
0000000000047133	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000047138	jmp	0x4714b
000000000004713a	movq	%rax, %r15
000000000004713d	leaq	-0x28(%rbp), %rdi
0000000000047141	callq	0xacd20                         ## symbol stub for: __ZN8PCStringD1Ev
0000000000047146	jmp	0x47158
0000000000047148	movq	%rax, %r15
000000000004714b	movq	%r14, %rdi
000000000004714e	callq	__ZN9OZChannelD2Ev              ## OZChannel::~OZChannel()
0000000000047153	jmp	0x47158
0000000000047155	movq	%rax, %r15
0000000000047158	movq	%rbx, %rdi
000000000004715b	callq	__ZN17OZCompoundChannelD2Ev     ## OZCompoundChannel::~OZCompoundChannel()
0000000000047160	movq	%r15, %rdi
0000000000047163	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
