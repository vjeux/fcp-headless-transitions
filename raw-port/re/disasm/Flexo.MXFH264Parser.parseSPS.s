__ZN13MXFH264Parser8parseSPSEPKhi:
0000000001420b90	pushq	%rbp
0000000001420b91	movq	%rsp, %rbp
0000000001420b94	pushq	%r15
0000000001420b96	pushq	%r14
0000000001420b98	pushq	%r13
0000000001420b9a	pushq	%r12
0000000001420b9c	pushq	%rbx
0000000001420b9d	subq	$0x38, %rsp
0000000001420ba1	movq	%rdi, %rbx
0000000001420ba4	leaq	-0x58(%rbp), %r14
0000000001420ba8	movq	%r14, %rdi
0000000001420bab	callq	__ZN9VlcParser10initializeEPKhi ## VlcParser::initialize(unsigned char const*, int)
0000000001420bb0	movq	%r14, %rdi
0000000001420bb3	movl	$0x3, %esi
0000000001420bb8	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
0000000001420bbd	movq	%r14, %rdi
0000000001420bc0	movl	$0x5, %esi
0000000001420bc5	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
0000000001420bca	movq	%r14, %rdi
0000000001420bcd	movl	$0x8, %esi
0000000001420bd2	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
0000000001420bd7	movl	%eax, (%rbx)
0000000001420bd9	movq	%r14, %rdi
0000000001420bdc	movl	$0x8, %esi
0000000001420be1	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
0000000001420be6	movl	%eax, 0x4(%rbx)
0000000001420be9	movq	%r14, %rdi
0000000001420bec	movl	$0x8, %esi
0000000001420bf1	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
0000000001420bf6	movl	%eax, 0x8(%rbx)
0000000001420bf9	movq	%r14, %rdi
0000000001420bfc	callq	__ZN9VlcParser2ueEv             ## VlcParser::ue()
0000000001420c01	movl	%eax, 0xc(%rbx)
0000000001420c04	movl	(%rbx), %eax
0000000001420c06	leal	-0x53(%rax), %ecx
0000000001420c09	cmpl	$0x27, %ecx
0000000001420c0c	ja	0x1420d1f
0000000001420c12	movabsq	$0x8008020009, %rdx             ## imm = 0x8008020009
0000000001420c1c	btq	%rcx, %rdx
0000000001420c20	jae	0x1420d1f
0000000001420c26	leaq	-0x58(%rbp), %rdi
0000000001420c2a	callq	__ZN9VlcParser2ueEv             ## VlcParser::ue()
0000000001420c2f	movl	%eax, 0x10(%rbx)
0000000001420c32	cmpl	$0x3, %eax
0000000001420c35	jne	0x1420c48
0000000001420c37	leaq	-0x58(%rbp), %rdi
0000000001420c3b	movl	$0x1, %esi
0000000001420c40	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
0000000001420c45	movl	%eax, 0x14(%rbx)
0000000001420c48	movq	%r14, %rdi
0000000001420c4b	callq	__ZN9VlcParser2ueEv             ## VlcParser::ue()
0000000001420c50	movl	%eax, 0x18(%rbx)
0000000001420c53	movq	%r14, %rdi
0000000001420c56	callq	__ZN9VlcParser2ueEv             ## VlcParser::ue()
0000000001420c5b	movl	%eax, 0x1c(%rbx)
0000000001420c5e	movq	%r14, %rdi
0000000001420c61	movl	$0x1, %esi
0000000001420c66	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
0000000001420c6b	movl	%eax, 0x20(%rbx)
0000000001420c6e	movq	%r14, %rdi
0000000001420c71	movl	$0x1, %esi
0000000001420c76	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
0000000001420c7b	movl	%eax, 0x24(%rbx)
0000000001420c7e	testl	%eax, %eax
0000000001420c80	je	0x1420d33
0000000001420c86	xorl	%r15d, %r15d
0000000001420c89	jmp	0x1420cac
0000000001420c8b	nopl	(%rax,%rax)
0000000001420c90	incl	%r15d
0000000001420c93	xorl	%eax, %eax
0000000001420c95	cmpl	$0x3, 0x10(%rbx)
0000000001420c99	sete	%al
0000000001420c9c	leal	0x8(,%rax,4), %eax
0000000001420ca3	cmpl	%eax, %r15d
0000000001420ca6	jae	0x1420d33
0000000001420cac	movq	%r14, %rdi
0000000001420caf	movl	$0x1, %esi
0000000001420cb4	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
0000000001420cb9	testl	%eax, %eax
0000000001420cbb	je	0x1420c90
0000000001420cbd	cmpl	$0x6, %r15d
0000000001420cc1	movl	$0x40, %r13d
0000000001420cc7	movl	$0x10, %eax
0000000001420ccc	cmovbl	%eax, %r13d
0000000001420cd0	movl	$0x8, %r12d
0000000001420cd6	movl	$0x8, %ecx
0000000001420cdb	jmp	0x1420d0f
0000000001420cdd	nopl	(%rax)
0000000001420ce0	movq	%r14, %rdi
0000000001420ce3	callq	__ZN9VlcParser2seEv             ## VlcParser::se()
0000000001420ce8	leal	(%rax,%r12), %ecx
0000000001420cec	addl	$0x100, %ecx                    ## imm = 0x100
0000000001420cf2	addl	%r12d, %eax
0000000001420cf5	addl	$0x1ff, %eax                    ## imm = 0x1FF
0000000001420cfa	testl	%ecx, %ecx
0000000001420cfc	cmovnsl	%ecx, %eax
0000000001420cff	andl	$0xffffff00, %eax               ## imm = 0xFFFFFF00
0000000001420d04	subl	%eax, %ecx
0000000001420d06	cmovnel	%ecx, %r12d
0000000001420d0a	decl	%r13d
0000000001420d0d	je	0x1420c90
0000000001420d0f	testl	%ecx, %ecx
0000000001420d11	jne	0x1420ce0
0000000001420d13	xorl	%ecx, %ecx
0000000001420d15	decl	%r13d
0000000001420d18	jne	0x1420d0f
0000000001420d1a	jmp	0x1420c90
0000000001420d1f	cmpl	$0xf4, %eax
0000000001420d24	je	0x1420c26
0000000001420d2a	cmpl	$0x2c, %eax
0000000001420d2d	je	0x1420c26
0000000001420d33	leaq	-0x58(%rbp), %r14
0000000001420d37	movq	%r14, %rdi
0000000001420d3a	callq	__ZN9VlcParser2ueEv             ## VlcParser::ue()
0000000001420d3f	movl	%eax, 0x28(%rbx)
0000000001420d42	movq	%r14, %rdi
0000000001420d45	callq	__ZN9VlcParser2ueEv             ## VlcParser::ue()
0000000001420d4a	movl	%eax, 0x2c(%rbx)
0000000001420d4d	cmpl	$0x1, %eax
0000000001420d50	je	0x1420d64
0000000001420d52	testl	%eax, %eax
0000000001420d54	jne	0x1420db1
0000000001420d56	leaq	-0x58(%rbp), %rdi
0000000001420d5a	callq	__ZN9VlcParser2ueEv             ## VlcParser::ue()
0000000001420d5f	movl	%eax, 0x30(%rbx)
0000000001420d62	jmp	0x1420db1
0000000001420d64	movq	%r14, %rdi
0000000001420d67	movl	$0x1, %esi
0000000001420d6c	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
0000000001420d71	movl	%eax, 0x34(%rbx)
0000000001420d74	movq	%r14, %rdi
0000000001420d77	callq	__ZN9VlcParser2seEv             ## VlcParser::se()
0000000001420d7c	movl	%eax, 0x38(%rbx)
0000000001420d7f	movq	%r14, %rdi
0000000001420d82	callq	__ZN9VlcParser2seEv             ## VlcParser::se()
0000000001420d87	movl	%eax, 0x3c(%rbx)
0000000001420d8a	movq	%r14, %rdi
0000000001420d8d	callq	__ZN9VlcParser2ueEv             ## VlcParser::ue()
0000000001420d92	movl	%eax, 0x40(%rbx)
0000000001420d95	testl	%eax, %eax
0000000001420d97	jle	0x1420db1
0000000001420d99	xorl	%r15d, %r15d
0000000001420d9c	nopl	(%rax)
0000000001420da0	movq	%r14, %rdi
0000000001420da3	callq	__ZN9VlcParser2seEv             ## VlcParser::se()
0000000001420da8	incl	%r15d
0000000001420dab	cmpl	0x40(%rbx), %r15d
0000000001420daf	jl	0x1420da0
0000000001420db1	leaq	-0x58(%rbp), %r14
0000000001420db5	movq	%r14, %rdi
0000000001420db8	callq	__ZN9VlcParser2ueEv             ## VlcParser::ue()
0000000001420dbd	movl	%eax, 0x44(%rbx)
0000000001420dc0	movq	%r14, %rdi
0000000001420dc3	movl	$0x1, %esi
0000000001420dc8	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
0000000001420dcd	movl	%eax, 0x48(%rbx)
0000000001420dd0	movq	%r14, %rdi
0000000001420dd3	callq	__ZN9VlcParser2ueEv             ## VlcParser::ue()
0000000001420dd8	movl	%eax, 0x4c(%rbx)
0000000001420ddb	movq	%r14, %rdi
0000000001420dde	callq	__ZN9VlcParser2ueEv             ## VlcParser::ue()
0000000001420de3	movl	%eax, 0x50(%rbx)
0000000001420de6	movq	%r14, %rdi
0000000001420de9	movl	$0x1, %esi
0000000001420dee	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
0000000001420df3	movl	%eax, 0x54(%rbx)
0000000001420df6	movl	0x4c(%rbx), %ecx
0000000001420df9	movl	0x50(%rbx), %edx
0000000001420dfc	shll	$0x4, %ecx
0000000001420dff	addl	$0x10, %ecx
0000000001420e02	movl	%ecx, 0x5c(%rbx)
0000000001420e05	incl	%edx
0000000001420e07	movl	%eax, %ecx
0000000001420e09	shll	$0x4, %ecx
0000000001420e0c	movl	$0x20, %esi
0000000001420e11	subl	%ecx, %esi
0000000001420e13	imull	%edx, %esi
0000000001420e16	movl	%esi, 0x60(%rbx)
0000000001420e19	testl	%eax, %eax
0000000001420e1b	jne	0x1420e2e
0000000001420e1d	leaq	-0x58(%rbp), %rdi
0000000001420e21	movl	$0x1, %esi
0000000001420e26	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
0000000001420e2b	movl	%eax, 0x58(%rbx)
0000000001420e2e	movq	%r14, %rdi
0000000001420e31	movl	$0x1, %esi
0000000001420e36	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
0000000001420e3b	movl	%eax, 0x64(%rbx)
0000000001420e3e	movq	%r14, %rdi
0000000001420e41	movl	$0x1, %esi
0000000001420e46	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
0000000001420e4b	movl	%eax, 0x68(%rbx)
0000000001420e4e	testl	%eax, %eax
0000000001420e50	je	0x1420e8d
0000000001420e52	movq	%r14, %rdi
0000000001420e55	callq	__ZN9VlcParser2ueEv             ## VlcParser::ue()
0000000001420e5a	movl	%eax, %r15d
0000000001420e5d	movq	%r14, %rdi
0000000001420e60	callq	__ZN9VlcParser2ueEv             ## VlcParser::ue()
0000000001420e65	addl	%r15d, %eax
0000000001420e68	subl	%eax, 0x5c(%rbx)
0000000001420e6b	movq	%r14, %rdi
0000000001420e6e	callq	__ZN9VlcParser2ueEv             ## VlcParser::ue()
0000000001420e73	movl	%eax, %r15d
0000000001420e76	movq	%r14, %rdi
0000000001420e79	callq	__ZN9VlcParser2ueEv             ## VlcParser::ue()
0000000001420e7e	movl	0x54(%rbx), %ecx
0000000001420e81	addl	$-0x2, %ecx
0000000001420e84	addl	%r15d, %eax
0000000001420e87	imull	%ecx, %eax
0000000001420e8a	addl	%eax, 0x60(%rbx)
0000000001420e8d	leaq	-0x58(%rbp), %rdi
0000000001420e91	movl	$0x1, %esi
0000000001420e96	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
0000000001420e9b	movl	%eax, 0x6c(%rbx)
0000000001420e9e	testl	%eax, %eax
0000000001420ea0	je	0x1420f98
0000000001420ea6	leaq	-0x58(%rbp), %rdi
0000000001420eaa	movl	$0x1, %esi
0000000001420eaf	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
0000000001420eb4	testl	%eax, %eax
0000000001420eb6	je	0x1420ee7
0000000001420eb8	leaq	-0x58(%rbp), %rdi
0000000001420ebc	movl	$0x8, %esi
0000000001420ec1	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
0000000001420ec6	cmpl	$0xff, %eax
0000000001420ecb	jne	0x1420ee7
0000000001420ecd	movq	%r14, %rdi
0000000001420ed0	movl	$0x10, %esi
0000000001420ed5	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
0000000001420eda	movq	%r14, %rdi
0000000001420edd	movl	$0x10, %esi
0000000001420ee2	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
0000000001420ee7	leaq	-0x58(%rbp), %rdi
0000000001420eeb	movl	$0x1, %esi
0000000001420ef0	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
0000000001420ef5	testl	%eax, %eax
0000000001420ef7	je	0x1420f07
0000000001420ef9	leaq	-0x58(%rbp), %rdi
0000000001420efd	movl	$0x1, %esi
0000000001420f02	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
0000000001420f07	leaq	-0x58(%rbp), %rdi
0000000001420f0b	movl	$0x1, %esi
0000000001420f10	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
0000000001420f15	testl	%eax, %eax
0000000001420f17	je	0x1420f72
0000000001420f19	movq	%r14, %rdi
0000000001420f1c	movl	$0x3, %esi
0000000001420f21	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
0000000001420f26	movq	%r14, %rdi
0000000001420f29	movl	$0x1, %esi
0000000001420f2e	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
0000000001420f33	movl	%eax, 0x70(%rbx)
0000000001420f36	movq	%r14, %rdi
0000000001420f39	movl	$0x1, %esi
0000000001420f3e	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
0000000001420f43	testl	%eax, %eax
0000000001420f45	je	0x1420f72
0000000001420f47	leaq	-0x58(%rbp), %rbx
0000000001420f4b	movq	%rbx, %rdi
0000000001420f4e	movl	$0x8, %esi
0000000001420f53	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
0000000001420f58	movq	%rbx, %rdi
0000000001420f5b	movl	$0x8, %esi
0000000001420f60	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
0000000001420f65	movq	%rbx, %rdi
0000000001420f68	movl	$0x8, %esi
0000000001420f6d	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
0000000001420f72	leaq	-0x58(%rbp), %rdi
0000000001420f76	movl	$0x1, %esi
0000000001420f7b	callq	__ZN15BitstreamReader7getBitsEi ## BitstreamReader::getBits(int)
0000000001420f80	testl	%eax, %eax
0000000001420f82	je	0x1420f98
0000000001420f84	leaq	-0x58(%rbp), %rbx
0000000001420f88	movq	%rbx, %rdi
0000000001420f8b	callq	__ZN9VlcParser2ueEv             ## VlcParser::ue()
0000000001420f90	movq	%rbx, %rdi
0000000001420f93	callq	__ZN9VlcParser2ueEv             ## VlcParser::ue()
0000000001420f98	addq	$0x38, %rsp
0000000001420f9c	popq	%rbx
0000000001420f9d	popq	%r12
0000000001420f9f	popq	%r13
0000000001420fa1	popq	%r14
0000000001420fa3	popq	%r15
0000000001420fa5	popq	%rbp
0000000001420fa6	retq
0000000001420fa7	nopw	(%rax,%rax)
