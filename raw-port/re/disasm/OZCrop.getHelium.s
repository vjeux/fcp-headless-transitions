__ZN6OZCrop9getHeliumER7LiAgent:
000000000041e8b0	pushq	%rbp
000000000041e8b1	movq	%rsp, %rbp
000000000041e8b4	pushq	%r15
000000000041e8b6	pushq	%r14
000000000041e8b8	pushq	%rbx
000000000041e8b9	subq	$0x1f8, %rsp                    ## imm = 0x1F8
000000000041e8c0	movq	%rdi, %rbx
000000000041e8c3	movsd	0x38(%rsi), %xmm1
000000000041e8c8	xorpd	%xmm0, %xmm0
000000000041e8cc	ucomisd	%xmm0, %xmm1
000000000041e8d0	jbe	0x41ea48
000000000041e8d6	movq	%rsi, %r15
000000000041e8d9	movsd	0x40(%rsi), %xmm1
000000000041e8de	ucomisd	%xmm0, %xmm1
000000000041e8e2	jbe	0x41ea48
000000000041e8e8	movq	%rdx, %r14
000000000041e8eb	leaq	0x28(%r15), %rsi
000000000041e8ef	movaps	0x2e856a(%rip), %xmm0
000000000041e8f6	movaps	%xmm0, -0x30(%rbp)
000000000041e8fa	xorps	%xmm0, %xmm0
000000000041e8fd	movaps	%xmm0, -0x70(%rbp)
000000000041e901	movaps	0x2e6ab8(%rip), %xmm0
000000000041e908	movaps	%xmm0, -0x60(%rbp)
000000000041e90c	movq	0xa0(%rdx), %rax
000000000041e913	movups	0x70(%rax), %xmm0
000000000041e917	movaps	%xmm0, -0x120(%rbp)
000000000041e91e	movups	0x60(%rax), %xmm0
000000000041e922	movaps	%xmm0, -0x130(%rbp)
000000000041e929	movups	0x50(%rax), %xmm0
000000000041e92d	movaps	%xmm0, -0x140(%rbp)
000000000041e934	movups	0x40(%rax), %xmm0
000000000041e938	movaps	%xmm0, -0x150(%rbp)
000000000041e93f	movdqu	(%rax), %xmm0
000000000041e943	movupd	0x10(%rax), %xmm1
000000000041e948	movdqu	0x20(%rax), %xmm2
000000000041e94d	movupd	0x30(%rax), %xmm3
000000000041e952	movapd	%xmm3, -0x160(%rbp)
000000000041e95a	movdqa	%xmm2, -0x170(%rbp)
000000000041e962	movapd	%xmm1, -0x180(%rbp)
000000000041e96a	movdqa	%xmm0, -0x190(%rbp)
000000000041e972	leaq	-0x190(%rbp), %rdi
000000000041e979	leaq	-0x70(%rbp), %rdx
000000000041e97d	callq	__ZNK14PCMatrix44TmplIdE13transformRectIdEEbRK6PCRectIT_ERS4_ ## bool PCMatrix44Tmpl<double>::transformRect<double>(PCRect<double> const&, PCRect<double>&) const
000000000041e982	testb	%al, %al
000000000041e984	je	0x41ea54
000000000041e98a	movapd	-0x70(%rbp), %xmm0
000000000041e98f	movapd	0x2e8489(%rip), %xmm1
000000000041e997	addpd	%xmm0, %xmm1
000000000041e99b	roundpd	$0x9, %xmm1, %xmm1
000000000041e9a1	cvttpd2dq	%xmm1, %xmm1
000000000041e9a5	addpd	-0x60(%rbp), %xmm0
000000000041e9aa	roundpd	$0xa, %xmm0, %xmm0
000000000041e9b0	cvttpd2dq	%xmm0, %xmm2
000000000041e9b4	movapd	%xmm2, -0x80(%rbp)
000000000041e9b9	psubd	%xmm1, %xmm2
000000000041e9bd	movaps	%xmm1, -0x90(%rbp)
000000000041e9c4	movdqa	%xmm1, %xmm0
000000000041e9c8	movdqa	%xmm2, -0xa0(%rbp)
000000000041e9d0	punpcklqdq	%xmm2, %xmm0            ## xmm0 = xmm0[0],xmm2[0]
000000000041e9d4	movdqa	%xmm0, -0x30(%rbp)
000000000041e9d9	movq	%r14, %rdi
000000000041e9dc	callq	0x6df960                        ## symbol stub for: __ZNK7LiAgent7haveROIEv
000000000041e9e1	testb	%al, %al
000000000041e9e3	je	0x41ea6c
000000000041e9e9	leaq	-0x210(%rbp), %rdi
000000000041e9f0	movq	%r14, %rsi
000000000041e9f3	callq	0x6df954                        ## symbol stub for: __ZNK7LiAgent6getROIEv
000000000041e9f8	movdqa	-0xa0(%rbp), %xmm0
000000000041ea00	movd	%xmm0, %eax
000000000041ea04	pextrd	$0x1, %xmm0, %ecx
000000000041ea0a	orl	%eax, %ecx
000000000041ea0c	js	0x41ea6c
000000000041ea0e	movq	-0x210(%rbp), %xmm0
000000000041ea16	movdqa	-0x90(%rbp), %xmm2
000000000041ea1e	pmaxsd	%xmm0, %xmm2
000000000041ea23	movq	-0x208(%rbp), %xmm1
000000000041ea2b	paddd	%xmm0, %xmm1
000000000041ea2f	movdqa	-0x80(%rbp), %xmm0
000000000041ea34	pminsd	%xmm1, %xmm0
000000000041ea39	psubd	%xmm2, %xmm0
000000000041ea3d	punpcklqdq	%xmm0, %xmm2            ## xmm2 = xmm2[0],xmm0[0]
000000000041ea41	movdqa	%xmm2, -0x30(%rbp)
000000000041ea46	jmp	0x41ea6c
000000000041ea48	movq	$0x0, (%rbx)
000000000041ea4f	jmp	0x41eb85
000000000041ea54	movq	%r14, %rdi
000000000041ea57	callq	0x6df960                        ## symbol stub for: __ZNK7LiAgent7haveROIEv
000000000041ea5c	testb	%al, %al
000000000041ea5e	je	0x41ea78
000000000041ea60	leaq	-0x30(%rbp), %rdi
000000000041ea64	movq	%r14, %rsi
000000000041ea67	callq	0x6df954                        ## symbol stub for: __ZNK7LiAgent6getROIEv
000000000041ea6c	leaq	-0x30(%rbp), %rsi
000000000041ea70	movq	%r14, %rdi
000000000041ea73	callq	0x6deb62                        ## symbol stub for: __ZN7LiAgent11setInputROIERK6PCRectIiE
000000000041ea78	movl	$0x1, 0x20(%r14)
000000000041ea80	movq	0x10(%r15), %rdx
000000000041ea84	movq	%rbx, %rdi
000000000041ea87	movq	%r14, %rsi
000000000041ea8a	callq	0x6debb0                        ## symbol stub for: __ZN7LiAgent9getHeliumEP13LiImageSource
000000000041ea8f	leaq	-0x50(%rbp), %rdi
000000000041ea93	movq	%r14, %rsi
000000000041ea96	callq	0x6deb5c                        ## symbol stub for: __ZN7LiAgent11getBoundaryEv
000000000041ea9b	movsd	-0x40(%rbp), %xmm0
000000000041eaa0	pxor	%xmm2, %xmm2
000000000041eaa4	ucomisd	%xmm0, %xmm2
000000000041eaa8	ja	0x41eae8
000000000041eaaa	movsd	-0x38(%rbp), %xmm1
000000000041eaaf	ucomisd	%xmm1, %xmm2
000000000041eab3	ja	0x41eae8
000000000041eab5	movapd	-0x50(%rbp), %xmm2
000000000041eaba	movupd	0x28(%r15), %xmm3
000000000041eac0	movupd	0x38(%r15), %xmm4
000000000041eac6	addpd	%xmm3, %xmm4
000000000041eaca	maxpd	%xmm2, %xmm3
000000000041eace	unpcklpd	%xmm1, %xmm0                    ## xmm0 = xmm0[0],xmm1[0]
000000000041ead2	addpd	%xmm2, %xmm0
000000000041ead6	minpd	%xmm0, %xmm4
000000000041eada	subpd	%xmm3, %xmm4
000000000041eade	movapd	%xmm3, -0x50(%rbp)
000000000041eae3	movapd	%xmm4, -0x40(%rbp)
000000000041eae8	movq	%r14, %rdi
000000000041eaeb	callq	0x6df95a                        ## symbol stub for: __ZNK7LiAgent7getCropEv
000000000041eaf0	leaq	-0x110(%rbp), %rdi
000000000041eaf7	movq	%rax, %rsi
000000000041eafa	callq	0x6ddc26                        ## symbol stub for: __ZN14LiImagePolygonC1ERKS_
000000000041eaff	movq	-0xc8(%rbp), %rax
000000000041eb06	subq	-0xd0(%rbp), %rax
000000000041eb0d	shrq	$0x5, %rax
000000000041eb11	testl	%eax, %eax
000000000041eb13	je	0x41eb41
000000000041eb15	leaq	-0x210(%rbp), %rdi
000000000041eb1c	xorpd	%xmm0, %xmm0
000000000041eb20	movq	%r14, %rsi
000000000041eb23	callq	0x6df924                        ## symbol stub for: __ZNK7LiAgent24getInversePixelTransformEd
000000000041eb28	leaq	-0x50(%rbp), %rdi
000000000041eb2c	leaq	-0x210(%rbp), %rsi
000000000041eb33	leaq	-0x110(%rbp), %rdx
000000000041eb3a	callq	0x6dd170                        ## symbol stub for: __Z18liTransformAndClipRK6PCRectIdERK14PCMatrix44TmplIdER14LiImagePolygon
000000000041eb3f	jmp	0x41eb6a
000000000041eb41	leaq	-0x110(%rbp), %rdi
000000000041eb48	leaq	-0x50(%rbp), %rsi
000000000041eb4c	xorl	%edx, %edx
000000000041eb4e	callq	0x6ddc1a                        ## symbol stub for: __ZN14LiImagePolygon3setERK6PCRectIdENS_8EdgeTypeE
000000000041eb53	leaq	-0x110(%rbp), %rsi
000000000041eb5a	movsd	0x2e8386(%rip), %xmm0
000000000041eb62	movq	%r14, %rdi
000000000041eb65	callq	0x6deb86                        ## symbol stub for: __ZN7LiAgent21projectAndClipPolygonER14LiImagePolygond
000000000041eb6a	leaq	-0x110(%rbp), %rsi
000000000041eb71	movq	%r14, %rdi
000000000041eb74	callq	0x6deba4                        ## symbol stub for: __ZN7LiAgent7outCropERK14LiImagePolygon
000000000041eb79	leaq	-0x110(%rbp), %rdi
000000000041eb80	callq	0x6ddc32                        ## symbol stub for: __ZN14LiImagePolygonD1Ev
000000000041eb85	movq	%rbx, %rax
000000000041eb88	addq	$0x1f8, %rsp                    ## imm = 0x1F8
000000000041eb8f	popq	%rbx
000000000041eb90	popq	%r14
000000000041eb92	popq	%r15
000000000041eb94	popq	%rbp
000000000041eb95	retq
000000000041eb96	jmp	0x41eb9c
000000000041eb98	jmp	0x41eb9c
000000000041eb9a	jmp	0x41ebad
000000000041eb9c	movq	%rax, %r14
000000000041eb9f	leaq	-0x110(%rbp), %rdi
000000000041eba6	callq	0x6ddc32                        ## symbol stub for: __ZN14LiImagePolygonD1Ev
000000000041ebab	jmp	0x41ebb0
000000000041ebad	movq	%rax, %r14
000000000041ebb0	movq	(%rbx), %rdi
000000000041ebb3	testq	%rdi, %rdi
000000000041ebb6	je	0x41ebbe
000000000041ebb8	movq	(%rdi), %rax
000000000041ebbb	callq	*0x18(%rax)
000000000041ebbe	movq	%r14, %rdi
000000000041ebc1	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
000000000041ebc6	movq	%rax, %rdi
000000000041ebc9	callq	___clang_call_terminate
000000000041ebce	nop
