__ZN10HGARRILogC6DecodeC2ENS_16SceneColorimetryEj:
00000000001027a0	pushq	%rbp
00000000001027a1	movq	%rsp, %rbp
00000000001027a4	pushq	%r15
00000000001027a6	pushq	%r14
00000000001027a8	pushq	%r12
00000000001027aa	pushq	%rbx
00000000001027ab	subq	$0x60, %rsp
00000000001027af	movl	%edx, %r14d
00000000001027b2	movl	%esi, %r15d
00000000001027b5	movq	%rdi, %rbx
00000000001027b8	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000001027bd	leaq	0x915ffc(%rip), %rax
00000000001027c4	movq	%rax, (%rbx)
00000000001027c7	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000001027cc	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001027d1	movq	%rax, %r12
00000000001027d4	movq	%rax, %rdi
00000000001027d7	callq	__ZN18HgcLogVideo_decodeC1Ev    ## HgcLogVideo_decode::HgcLogVideo_decode()
00000000001027dc	movq	%r12, 0x198(%rbx)
00000000001027e3	movl	$0x1f0, %edi                    ## imm = 0x1F0
00000000001027e8	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001027ed	movq	%rax, %r12
00000000001027f0	movq	%rax, %rdi
00000000001027f3	callq	__ZN13HGColorMatrixC1Ev         ## HGColorMatrix::HGColorMatrix()
00000000001027f8	movq	%r12, 0x1a0(%rbx)
00000000001027ff	testl	%r15d, %r15d
0000000000102802	jne	0x10280d
0000000000102804	leaq	__ZN12HGColorGamma22logGamutRGBToRec709RGBE(%rip), %rax ## HGColorGamma::logGamutRGBToRec709RGB
000000000010280b	jmp	0x102814
000000000010280d	leaq	__ZN12HGColorGamma23logGamutRGBToRec2020RGBE(%rip), %rax ## HGColorGamma::logGamutRGBToRec2020RGB
0000000000102814	subq	$-0x80, %rax
0000000000102818	movq	%rax, 0x1c8(%rbx)
000000000010281f	movq	0x8ffa8a(%rip), %rax            ## literal pool symbol address: __ZN10HGARRILogC18logCurveParametersE
0000000000102826	cmpl	$0xb4, %r14d
000000000010282d	jb	0x1028d0
0000000000102833	cmpl	$0xe1, %r14d
000000000010283a	jae	0x102845
000000000010283c	addq	$0x38, %rax
0000000000102840	jmp	0x1028d0
0000000000102845	cmpl	$0x11d, %r14d                   ## imm = 0x11D
000000000010284c	jae	0x102854
000000000010284e	addq	$0x70, %rax
0000000000102852	jmp	0x1028d0
0000000000102854	cmpl	$0x168, %r14d                   ## imm = 0x168
000000000010285b	jae	0x102864
000000000010285d	movl	$0xa8, %eax
0000000000102862	jmp	0x1028c9
0000000000102864	cmpl	$0x1c2, %r14d                   ## imm = 0x1C2
000000000010286b	jae	0x102874
000000000010286d	movl	$0xe0, %eax
0000000000102872	jmp	0x1028c9
0000000000102874	cmpl	$0x23a, %r14d                   ## imm = 0x23A
000000000010287b	jae	0x102884
000000000010287d	movl	$0x118, %eax                    ## imm = 0x118
0000000000102882	jmp	0x1028c9
0000000000102884	cmpl	$0x2d0, %r14d                   ## imm = 0x2D0
000000000010288b	jae	0x102894
000000000010288d	movl	$0x150, %eax                    ## imm = 0x150
0000000000102892	jmp	0x1028c9
0000000000102894	cmpl	$0x384, %r14d                   ## imm = 0x384
000000000010289b	jae	0x1028a4
000000000010289d	movl	$0x188, %eax                    ## imm = 0x188
00000000001028a2	jmp	0x1028c9
00000000001028a4	cmpl	$0x474, %r14d                   ## imm = 0x474
00000000001028ab	jae	0x1028b4
00000000001028ad	movl	$0x1c0, %eax                    ## imm = 0x1C0
00000000001028b2	jmp	0x1028c9
00000000001028b4	cmpl	$0x5a0, %r14d                   ## imm = 0x5A0
00000000001028bb	movl	$0x1f8, %ecx                    ## imm = 0x1F8
00000000001028c0	movl	$0x230, %eax                    ## imm = 0x230
00000000001028c5	cmovbq	%rcx, %rax
00000000001028c9	addq	0x8ff9e0(%rip), %rax            ## literal pool symbol address: __ZN10HGARRILogC18logCurveParametersE
00000000001028d0	movsd	0x8(%rax), %xmm3
00000000001028d5	movsd	0x20(%rax), %xmm4
00000000001028da	movsd	%xmm4, -0x28(%rbp)
00000000001028df	movsd	0x28(%rax), %xmm1
00000000001028e4	movsd	0x30(%rax), %xmm2
00000000001028e9	movapd	%xmm2, -0x80(%rbp)
00000000001028ee	movsd	0x2ce55a(%rip), %xmm0
00000000001028f6	mulsd	%xmm1, %xmm0
00000000001028fa	movapd	%xmm0, -0x70(%rbp)
00000000001028ff	movsd	0x2ce551(%rip), %xmm0
0000000000102907	mulsd	%xmm3, %xmm0
000000000010290b	mulsd	%xmm1, %xmm3
000000000010290f	addsd	%xmm2, %xmm3
0000000000102913	movsd	%xmm3, -0x30(%rbp)
0000000000102918	movl	$0x3e4ccccd, 0x1a8(%rbx)        ## imm = 0x3E4CCCCD
0000000000102922	movsd	0x2ce536(%rip), %xmm1
000000000010292a	mulsd	%xmm4, %xmm1
000000000010292e	movapd	%xmm1, -0x60(%rbp)
0000000000102933	movupd	0x10(%rax), %xmm1
0000000000102938	movapd	%xmm1, -0x50(%rbp)
000000000010293d	movsd	0x18(%rax), %xmm2
0000000000102942	movaps	%xmm2, -0x40(%rbp)
0000000000102946	addsd	%xmm1, %xmm0
000000000010294a	callq	0x3c53f0                        ## symbol stub for: _log10
000000000010294f	movapd	-0x40(%rbp), %xmm4
0000000000102954	mulsd	%xmm4, %xmm0
0000000000102958	addsd	-0x28(%rbp), %xmm0
000000000010295d	addsd	-0x30(%rbp), %xmm0
0000000000102962	mulsd	0x2c9856(%rip), %xmm0
000000000010296a	movapd	-0x50(%rbp), %xmm3
000000000010296f	movapd	%xmm3, %xmm1
0000000000102973	movhpd	0x2ce4ed(%rip), %xmm1           ## xmm1 = xmm1[0],mem[0]
000000000010297b	movapd	-0x60(%rbp), %xmm2
0000000000102980	blendpd	$0x2, 0x2ce826(%rip), %xmm2     ## xmm2 = xmm2[0],mem[1]
000000000010298a	movlpd	0x2ce4de(%rip), %xmm3           ## xmm3 = mem[0],xmm3[1]
0000000000102992	divpd	%xmm3, %xmm1
0000000000102996	movapd	-0x70(%rbp), %xmm3
000000000010299b	unpcklpd	%xmm3, %xmm4                    ## xmm4 = xmm4[0],xmm3[0]
000000000010299f	cvtpd2ps	%xmm1, %xmm1
00000000001029a3	divpd	%xmm4, %xmm2
00000000001029a7	cvtpd2ps	%xmm2, %xmm2
00000000001029ab	unpcklpd	%xmm2, %xmm1                    ## xmm1 = xmm1[0],xmm2[0]
00000000001029af	movupd	%xmm1, 0x1ac(%rbx)
00000000001029b7	movapd	-0x80(%rbp), %xmm1
00000000001029bc	xorpd	0x2c811c(%rip), %xmm1
00000000001029c4	divsd	%xmm3, %xmm1
00000000001029c8	unpcklpd	%xmm0, %xmm1                    ## xmm1 = xmm1[0],xmm0[0]
00000000001029cc	cvtpd2ps	%xmm1, %xmm0
00000000001029d0	movlpd	%xmm0, 0x1bc(%rbx)
00000000001029d8	addq	$0x60, %rsp
00000000001029dc	popq	%rbx
00000000001029dd	popq	%r12
00000000001029df	popq	%r14
00000000001029e1	popq	%r15
00000000001029e3	popq	%rbp
00000000001029e4	retq
00000000001029e5	jmp	0x1029e7
00000000001029e7	movq	%rax, %r14
00000000001029ea	movq	%r12, %rdi
00000000001029ed	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001029f2	movq	%rbx, %rdi
00000000001029f5	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000001029fa	movq	%r14, %rdi
00000000001029fd	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000102a02	movq	%rax, %r14
0000000000102a05	movq	%rbx, %rdi
0000000000102a08	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000102a0d	movq	%r14, %rdi
0000000000102a10	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000102a15	nopw	%cs:(%rax,%rax)
