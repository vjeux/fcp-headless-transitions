__ZN28OZShapeReparametrizedContourC2E6CMTime:
00000000005d3530	pushq	%rbp
00000000005d3531	movq	%rsp, %rbp
00000000005d3534	pushq	%r15
00000000005d3536	pushq	%r14
00000000005d3538	pushq	%r12
00000000005d353a	pushq	%rbx
00000000005d353b	subq	$0x20, %rsp
00000000005d353f	movq	%rdi, %rbx
00000000005d3542	xorps	%xmm0, %xmm0
00000000005d3545	movups	%xmm0, 0x18(%rdi)
00000000005d3549	movaps	0x131e70(%rip), %xmm1
00000000005d3550	movups	%xmm1, 0x28(%rdi)
00000000005d3554	movups	%xmm0, 0xc0(%rdi)
00000000005d355b	movups	%xmm0, 0xd0(%rdi)
00000000005d3562	movups	%xmm0, 0xe0(%rdi)
00000000005d3569	movups	%xmm0, 0xf0(%rdi)
00000000005d3570	movups	%xmm0, 0x100(%rdi)
00000000005d3577	movups	%xmm0, 0x110(%rdi)
00000000005d357e	movups	%xmm0, 0x120(%rdi)
00000000005d3585	movups	%xmm0, 0x130(%rdi)
00000000005d358c	movups	%xmm0, 0x140(%rdi)
00000000005d3593	movups	%xmm0, 0x150(%rdi)
00000000005d359a	movups	%xmm0, 0x160(%rdi)
00000000005d35a1	movups	%xmm0, 0x170(%rdi)
00000000005d35a8	movaps	0x10(%rbp), %xmm1
00000000005d35ac	movups	%xmm1, (%rdi)
00000000005d35af	movq	0x20(%rbp), %rax
00000000005d35b3	movq	%rax, 0x10(%rdi)
00000000005d35b7	movabsq	$0x3ff0000000000000, %rax       ## imm = 0x3FF0000000000000
00000000005d35c1	movq	%rax, 0xb0(%rdi)
00000000005d35c8	movq	%rax, 0x88(%rdi)
00000000005d35cf	movq	%rax, 0x60(%rdi)
00000000005d35d3	movq	%rax, 0x38(%rdi)
00000000005d35d7	movups	%xmm0, 0x40(%rdi)
00000000005d35db	movups	%xmm0, 0x50(%rdi)
00000000005d35df	movups	%xmm0, 0x68(%rdi)
00000000005d35e3	movups	%xmm0, 0x78(%rdi)
00000000005d35e7	movups	%xmm0, 0x90(%rdi)
00000000005d35ee	movups	%xmm0, 0xa0(%rdi)
00000000005d35f5	movl	$0x1000000, 0xb8(%rdi)          ## imm = 0x1000000
00000000005d35ff	movups	%xmm0, 0x1c0(%rdi)
00000000005d3606	movups	%xmm0, 0x1b0(%rdi)
00000000005d360d	movups	%xmm0, 0x1a0(%rdi)
00000000005d3614	movups	%xmm0, 0x190(%rdi)
00000000005d361b	movq	$0x0, 0x1d0(%rdi)
00000000005d3626	movl	$0x2c0, %edi                    ## imm = 0x2C0
00000000005d362b	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000005d3630	movq	%rax, %r14
00000000005d3633	leaq	0x21394e(%rip), %rsi            ## literal pool for: ""
00000000005d363a	leaq	-0x28(%rbp), %rdi
00000000005d363e	callq	0x6df09c                        ## symbol stub for: __ZN8PCStringC1EPKc
00000000005d3643	movq	0x25101e(%rip), %r15            ## literal pool symbol address: __ZN28OZShapeReparametrizedContour40OZShapeReparametrizedContour_contourImpl37_OZShapeReparametrizedContour_contourE
00000000005d364a	movq	(%r15), %r12
00000000005d364d	testq	%r12, %r12
00000000005d3650	jne	0x5d366a
00000000005d3652	movl	$0x30, %edi
00000000005d3657	callq	0x6dfca2                        ## symbol stub for: __Znwm
00000000005d365c	movq	%rax, %r12
00000000005d365f	movq	%rax, %rdi
00000000005d3662	callq	__ZN28OZShapeReparametrizedContour40OZShapeReparametrizedContour_contourImplC2Ev ## OZShapeReparametrizedContour::OZShapeReparametrizedContour_contourImpl::OZShapeReparametrizedContour_contourImpl()
00000000005d3667	movq	%r12, (%r15)
00000000005d366a	movq	%r12, (%rsp)
00000000005d366e	movq	$0x0, 0x8(%rsp)
00000000005d3677	leaq	-0x28(%rbp), %rsi
00000000005d367b	movq	%r14, %rdi
00000000005d367e	xorl	%edx, %edx
00000000005d3680	movl	$0x1, %ecx
00000000005d3685	movl	$0x823000a, %r8d                ## imm = 0x823000A
00000000005d368b	movl	$0x2, %r9d
00000000005d3691	callq	0x6de280                        ## symbol stub for: __ZN17OZChannelPositionC1ERK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo
00000000005d3696	movq	%r14, 0x180(%rbx)
00000000005d369d	leaq	-0x28(%rbp), %rdi
00000000005d36a1	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000005d36a6	movq	$0x0, 0x188(%rbx)
00000000005d36b1	addq	$0x20, %rsp
00000000005d36b5	popq	%rbx
00000000005d36b6	popq	%r12
00000000005d36b8	popq	%r14
00000000005d36ba	popq	%r15
00000000005d36bc	popq	%rbp
00000000005d36bd	retq
00000000005d36be	movq	%rax, %r15
00000000005d36c1	movq	%r12, %rdi
00000000005d36c4	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000005d36c9	jmp	0x5d36da
00000000005d36cb	movq	%rax, %r15
00000000005d36ce	jmp	0x5d36e3
00000000005d36d0	movq	%rax, %r15
00000000005d36d3	xorl	%edi, %edi
00000000005d36d5	jmp	0x5d370a
00000000005d36d7	movq	%rax, %r15
00000000005d36da	leaq	-0x28(%rbp), %rdi
00000000005d36de	callq	0x6df0c6                        ## symbol stub for: __ZN8PCStringD1Ev
00000000005d36e3	movq	%r14, %rdi
00000000005d36e6	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000005d36eb	movq	0x1c0(%rbx), %rdi
00000000005d36f2	testq	%rdi, %rdi
00000000005d36f5	je	0x5d3703
00000000005d36f7	movq	%rdi, 0x1c8(%rbx)
00000000005d36fe	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000005d3703	movq	0x1a8(%rbx), %rdi
00000000005d370a	leaq	0x190(%rbx), %r14
00000000005d3711	testq	%rdi, %rdi
00000000005d3714	jne	0x5d372e
00000000005d3716	movq	(%r14), %rdi
00000000005d3719	testq	%rdi, %rdi
00000000005d371c	jne	0x5d3742
00000000005d371e	movq	%rbx, %rdi
00000000005d3721	callq	__ZN14OZShapeContourD2Ev        ## OZShapeContour::~OZShapeContour()
00000000005d3726	movq	%r15, %rdi
00000000005d3729	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000005d372e	movq	%rdi, 0x1b0(%rbx)
00000000005d3735	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000005d373a	movq	(%r14), %rdi
00000000005d373d	testq	%rdi, %rdi
00000000005d3740	je	0x5d371e
00000000005d3742	movq	%rdi, 0x198(%rbx)
00000000005d3749	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
00000000005d374e	movq	%rbx, %rdi
00000000005d3751	callq	__ZN14OZShapeContourD2Ev        ## OZShapeContour::~OZShapeContour()
00000000005d3756	movq	%r15, %rdi
00000000005d3759	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000005d375e	nop
