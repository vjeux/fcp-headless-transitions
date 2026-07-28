__ZNK16HGSampleRectStat11analyzeFullEv:
0000000000148ce0	pushq	%rbp
0000000000148ce1	movq	%rsp, %rbp
0000000000148ce4	pushq	%r15
0000000000148ce6	pushq	%r14
0000000000148ce8	pushq	%r13
0000000000148cea	pushq	%r12
0000000000148cec	pushq	%rbx
0000000000148ced	subq	$0x38, %rsp
0000000000148cf1	movq	%rdi, %rbx
0000000000148cf4	movq	(%rdi), %rdi
0000000000148cf7	movq	(%rdi), %rax
0000000000148cfa	callq	*0x30(%rax)
0000000000148cfd	movq	%rax, %r15
0000000000148d00	movq	%rax, %rdi
0000000000148d03	callq	0x3c5612                        ## symbol stub for: _strlen
0000000000148d08	cmpq	$-0x9, %rax
0000000000148d0c	jae	0x148f70
0000000000148d12	movq	%rax, %r14
0000000000148d15	cmpq	$0x17, %rax
0000000000148d19	jae	0x148d2d
0000000000148d1b	leal	(%r14,%r14), %eax
0000000000148d1f	movb	%al, -0x40(%rbp)
0000000000148d22	leaq	-0x3f(%rbp), %r12
0000000000148d26	testq	%r14, %r14
0000000000148d29	jne	0x148d60
0000000000148d2b	jmp	0x148d6e
0000000000148d2d	movq	%r14, %rax
0000000000148d30	orq	$0x7, %rax
0000000000148d34	leaq	0x1(%rax), %rcx
0000000000148d38	cmpq	$0x17, %rax
0000000000148d3c	movl	$0x1a, %r13d
0000000000148d42	cmovneq	%rcx, %r13
0000000000148d46	movq	%r13, %rdi
0000000000148d49	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000148d4e	movq	%rax, %r12
0000000000148d51	movq	%rax, -0x30(%rbp)
0000000000148d55	incq	%r13
0000000000148d58	movq	%r13, -0x40(%rbp)
0000000000148d5c	movq	%r14, -0x38(%rbp)
0000000000148d60	movq	%r12, %rdi
0000000000148d63	movq	%r15, %rsi
0000000000148d66	movq	%r14, %rdx
0000000000148d69	callq	0x3c543e                        ## symbol stub for: _memmove
0000000000148d6e	movb	$0x0, (%r12,%r14)
0000000000148d73	movabsq	$0x656764456548694c, %rax       ## imm = 0x656764456548694C
0000000000148d7d	movq	%rax, -0x5f(%rbp)
0000000000148d81	movzbl	-0x40(%rbp), %r13d
0000000000148d86	testb	$0x1, %r13b
0000000000148d8a	je	0x148d98
0000000000148d8c	movq	-0x38(%rbp), %rax
0000000000148d90	cmpq	$0x8, %rax
0000000000148d94	je	0x148da3
0000000000148d96	jmp	0x148dcc
0000000000148d98	movl	%r13d, %eax
0000000000148d9b	shrl	%eax
0000000000148d9d	cmpq	$0x8, %rax
0000000000148da1	jne	0x148dcc
0000000000148da3	testb	$0x1, %r13b
0000000000148da7	je	0x148dbb
0000000000148da9	movq	-0x30(%rbp), %rax
0000000000148dad	movq	(%rax), %rax
0000000000148db0	cmpq	-0x5f(%rbp), %rax
0000000000148db4	jne	0x148dcc
0000000000148db6	jmp	0x148f44
0000000000148dbb	leaq	-0x3f(%rbp), %rax
0000000000148dbf	movq	(%rax), %rax
0000000000148dc2	cmpq	-0x5f(%rbp), %rax
0000000000148dc6	je	0x148f44
0000000000148dcc	callq	__ZN9ROIStatIO4openEv           ## ROIStatIO::open()
0000000000148dd1	movq	%rax, %r14
0000000000148dd4	movq	__ZN14MotionROIFrame6_pThisE(%rip), %rax ## MotionROIFrame::_pThis
0000000000148ddb	testq	%rax, %rax
0000000000148dde	je	0x148de4
0000000000148de0	movl	(%rax), %edx
0000000000148de2	jmp	0x148e00
0000000000148de4	movl	$0x4, %edi
0000000000148de9	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000148dee	movl	$0xffffffff, (%rax)             ## imm = 0xFFFFFFFF
0000000000148df4	movq	%rax, __ZN14MotionROIFrame6_pThisE(%rip) ## MotionROIFrame::_pThis
0000000000148dfb	movl	$0xffffffff, %edx               ## imm = 0xFFFFFFFF
0000000000148e00	leaq	-0x40(%rbp), %rsi
0000000000148e04	movq	%r14, %rdi
0000000000148e07	callq	__ZN9ROIStatIO8currNodeERKNSt3__112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEEi ## ROIStatIO::currNode(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&, int)
0000000000148e0c	movl	0x2c(%rbx), %eax
0000000000148e0f	cmpl	$0xf423f, %eax                  ## imm = 0xF423F
0000000000148e14	je	0x148ee5
0000000000148e1a	cmpb	$0x1, 0x3c(%rbx)
0000000000148e1e	jne	0x148e30
0000000000148e20	movq	__ZN14MotionROIFrame6_pThisE(%rip), %rax ## MotionROIFrame::_pThis
0000000000148e27	testq	%rax, %rax
0000000000148e2a	je	0x148e84
0000000000148e2c	movl	(%rax), %edx
0000000000148e2e	jmp	0x148ea0
0000000000148e30	movl	0x20(%rbx), %ecx
0000000000148e33	subl	0x18(%rbx), %ecx
0000000000148e36	cvtsi2ss	%ecx, %xmm0
0000000000148e3a	movl	0x34(%rbx), %ecx
0000000000148e3d	subl	%eax, %ecx
0000000000148e3f	cvtsi2ss	%ecx, %xmm1
0000000000148e43	movl	0x24(%rbx), %eax
0000000000148e46	subl	0x1c(%rbx), %eax
0000000000148e49	cvtsi2ss	%eax, %xmm2
0000000000148e4d	divss	%xmm1, %xmm0
0000000000148e51	movl	0x38(%rbx), %eax
0000000000148e54	subl	0x30(%rbx), %eax
0000000000148e57	mulss	%xmm0, %xmm2
0000000000148e5b	xorps	%xmm0, %xmm0
0000000000148e5e	cvtsi2ss	%eax, %xmm0
0000000000148e62	divss	%xmm0, %xmm2
0000000000148e66	movss	%xmm2, -0x44(%rbp)
0000000000148e6b	ucomiss	0x27ee4e(%rip), %xmm2
0000000000148e72	jbe	0x148ee5
0000000000148e74	movq	__ZN14MotionROIFrame6_pThisE(%rip), %rax ## MotionROIFrame::_pThis
0000000000148e7b	testq	%rax, %rax
0000000000148e7e	je	0x148eb1
0000000000148e80	movl	(%rax), %edx
0000000000148e82	jmp	0x148ecd
0000000000148e84	movl	$0x4, %edi
0000000000148e89	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000148e8e	movl	$0xffffffff, (%rax)             ## imm = 0xFFFFFFFF
0000000000148e94	movq	%rax, __ZN14MotionROIFrame6_pThisE(%rip) ## MotionROIFrame::_pThis
0000000000148e9b	movl	$0xffffffff, %edx               ## imm = 0xFFFFFFFF
0000000000148ea0	movl	0x28(%rbx), %ecx
0000000000148ea3	leaq	-0x40(%rbp), %rsi
0000000000148ea7	movq	%r14, %rdi
0000000000148eaa	callq	__ZN9ROIStatIO6failedERKNSt3__112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEEii ## ROIStatIO::failed(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&, int, int)
0000000000148eaf	jmp	0x148ee5
0000000000148eb1	movl	$0x4, %edi
0000000000148eb6	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000148ebb	movl	$0xffffffff, (%rax)             ## imm = 0xFFFFFFFF
0000000000148ec1	movq	%rax, __ZN14MotionROIFrame6_pThisE(%rip) ## MotionROIFrame::_pThis
0000000000148ec8	movl	$0xffffffff, %edx               ## imm = 0xFFFFFFFF
0000000000148ecd	movss	-0x44(%rbp), %xmm0
0000000000148ed2	cvtss2sd	%xmm0, %xmm0
0000000000148ed6	movl	0x28(%rbx), %ecx
0000000000148ed9	leaq	-0x40(%rbp), %rsi
0000000000148edd	movq	%r14, %rdi
0000000000148ee0	callq	__ZN9ROIStatIO4overERKNSt3__112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEEiid ## ROIStatIO::over(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&, int, int, double)
0000000000148ee5	movq	0x80(%r14), %r15
0000000000148eec	testq	%r15, %r15
0000000000148eef	je	0x148f2a
0000000000148ef1	leaq	0x8(%r14), %r12
0000000000148ef5	movq	(%r12), %rax
0000000000148ef9	movq	%r12, %rdi
0000000000148efc	callq	*0x30(%rax)
0000000000148eff	movl	%eax, %ebx
0000000000148f01	movq	%r15, %rdi
0000000000148f04	callq	0x3c5102                        ## symbol stub for: _fclose
0000000000148f09	movl	%eax, %r15d
0000000000148f0c	movq	$0x0, 0x80(%r14)
0000000000148f17	movq	0x8(%r14), %rax
0000000000148f1b	movq	%r12, %rdi
0000000000148f1e	xorl	%esi, %esi
0000000000148f20	xorl	%edx, %edx
0000000000148f22	callq	*0x18(%rax)
0000000000148f25	orl	%ebx, %r15d
0000000000148f28	je	0x148f44
0000000000148f2a	movq	(%r14), %rax
0000000000148f2d	movq	-0x18(%rax), %rax
0000000000148f31	movq	%r14, %rdi
0000000000148f34	addq	%rax, %rdi
0000000000148f37	movl	0x20(%r14,%rax), %esi
0000000000148f3c	orl	$0x4, %esi
0000000000148f3f	callq	0x3c4f5e                        ## symbol stub for: __ZNSt3__18ios_base5clearEj
0000000000148f44	testb	$0x1, %r13b
0000000000148f48	jne	0x148f59
0000000000148f4a	addq	$0x38, %rsp
0000000000148f4e	popq	%rbx
0000000000148f4f	popq	%r12
0000000000148f51	popq	%r13
0000000000148f53	popq	%r14
0000000000148f55	popq	%r15
0000000000148f57	popq	%rbp
0000000000148f58	retq
0000000000148f59	movq	-0x30(%rbp), %rdi
0000000000148f5d	addq	$0x38, %rsp
0000000000148f61	popq	%rbx
0000000000148f62	popq	%r12
0000000000148f64	popq	%r13
0000000000148f66	popq	%r14
0000000000148f68	popq	%r15
0000000000148f6a	popq	%rbp
0000000000148f6b	jmp	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000148f70	callq	__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE20__throw_length_errorB9nqe210106Ev ## std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>::__throw_length_error[abi:nqe210106]()
0000000000148f75	jmp	0x148f84
0000000000148f77	movq	%rax, %rbx
0000000000148f7a	movq	%r15, %rdi
0000000000148f7d	callq	0x3c5102                        ## symbol stub for: _fclose
0000000000148f82	jmp	0x148f87
0000000000148f84	movq	%rax, %rbx
0000000000148f87	testb	$0x1, %r13b
0000000000148f8b	je	0x148f96
0000000000148f8d	movq	-0x30(%rbp), %rdi
0000000000148f91	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000148f96	movq	%rbx, %rdi
0000000000148f99	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000148f9e	nop
