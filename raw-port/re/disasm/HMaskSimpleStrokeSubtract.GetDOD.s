__ZN25HMaskSimpleStrokeSubtract6GetDODEP10HGRendereri6HGRect:
0000000000425aa0	testl	%edx, %edx
0000000000425aa2	je	0x425ab3
0000000000425aa4	movq	0x3fb275(%rip), %rcx            ## literal pool symbol address: _HGRectNull
0000000000425aab	movq	(%rcx), %rax
0000000000425aae	movq	0x8(%rcx), %rdx
0000000000425ab2	retq
0000000000425ab3	pushq	%rbp
0000000000425ab4	movq	%rsp, %rbp
0000000000425ab7	pushq	%r15
0000000000425ab9	pushq	%r14
0000000000425abb	pushq	%r13
0000000000425abd	pushq	%r12
0000000000425abf	pushq	%rbx
0000000000425ac0	subq	$0x18, %rsp
0000000000425ac4	movq	%rsi, %r15
0000000000425ac7	movq	%rdi, %r12
0000000000425aca	movq	%rsi, %rdi
0000000000425acd	movq	%r12, %rsi
0000000000425ad0	xorl	%edx, %edx
0000000000425ad2	callq	0x6dd37a                        ## symbol stub for: __ZN10HGRenderer8GetInputEP6HGNodei
0000000000425ad7	movq	%r15, %rdi
0000000000425ada	movq	%rax, %rsi
0000000000425add	callq	0x6dd36e                        ## symbol stub for: __ZN10HGRenderer6GetDODEP6HGNode
0000000000425ae2	movq	%rax, %rbx
0000000000425ae5	movq	%rdx, %r13
0000000000425ae8	movq	%rax, %rdi
0000000000425aeb	movq	%rdx, %rsi
0000000000425aee	callq	0x6dcc9c                        ## symbol stub for: _HGRectIsNull
0000000000425af3	movl	$0xffffffff, %r14d              ## imm = 0xFFFFFFFF
0000000000425af9	movl	$0x0, %edx
0000000000425afe	movl	$0x0, %ecx
0000000000425b03	movl	$0xffffffff, %edi               ## imm = 0xFFFFFFFF
0000000000425b08	movl	$0xffffffff, %esi               ## imm = 0xFFFFFFFF
0000000000425b0d	testl	%eax, %eax
0000000000425b0f	jne	0x425b59
0000000000425b11	cmpl	$0xc0000002, %ebx               ## imm = 0xC0000002
0000000000425b17	movl	$0xc0000001, %ecx               ## imm = 0xC0000001
0000000000425b1c	movl	$0xc0000001, %edx               ## imm = 0xC0000001
0000000000425b21	cmovgel	%ebx, %edx
0000000000425b24	shrq	$0x20, %rbx
0000000000425b28	cmpl	$0xc0000002, %ebx               ## imm = 0xC0000002
0000000000425b2e	cmovgel	%ebx, %ecx
0000000000425b31	cmpl	$0x3ffffffe, %r13d              ## imm = 0x3FFFFFFE
0000000000425b38	movl	$0x3ffffffe, %esi               ## imm = 0x3FFFFFFE
0000000000425b3d	movl	$0x3ffffffe, %edi               ## imm = 0x3FFFFFFE
0000000000425b42	cmovll	%r13d, %edi
0000000000425b46	shrq	$0x20, %r13
0000000000425b4a	cmpl	$0x3ffffffe, %r13d              ## imm = 0x3FFFFFFE
0000000000425b51	cmovll	%r13d, %esi
0000000000425b55	subl	%edx, %edi
0000000000425b57	subl	%ecx, %esi
0000000000425b59	movl	%esi, -0x34(%rbp)
0000000000425b5c	movl	%edi, %r13d
0000000000425b5f	movl	%edx, -0x2c(%rbp)
0000000000425b62	movl	%ecx, -0x30(%rbp)
0000000000425b65	movq	%r15, %rdi
0000000000425b68	movq	%r12, %rsi
0000000000425b6b	movl	$0x1, %edx
0000000000425b70	callq	0x6dd37a                        ## symbol stub for: __ZN10HGRenderer8GetInputEP6HGNodei
0000000000425b75	movq	%r15, %rdi
0000000000425b78	movq	%rax, %rsi
0000000000425b7b	callq	0x6dd36e                        ## symbol stub for: __ZN10HGRenderer6GetDODEP6HGNode
0000000000425b80	movq	%rax, %rbx
0000000000425b83	movq	%rdx, %r15
0000000000425b86	movq	%rax, %rdi
0000000000425b89	movq	%rdx, %rsi
0000000000425b8c	callq	0x6dcc9c                        ## symbol stub for: _HGRectIsNull
0000000000425b91	movl	$0x0, %edi
0000000000425b96	movl	$0xffffffff, %ecx               ## imm = 0xFFFFFFFF
0000000000425b9b	testl	%eax, %eax
0000000000425b9d	movl	$0x0, %esi
0000000000425ba2	jne	0x425bee
0000000000425ba4	cmpl	$0xc0000002, %ebx               ## imm = 0xC0000002
0000000000425baa	movl	$0xc0000001, %esi               ## imm = 0xC0000001
0000000000425baf	movl	$0xc0000001, %edi               ## imm = 0xC0000001
0000000000425bb4	cmovgel	%ebx, %edi
0000000000425bb7	shrq	$0x20, %rbx
0000000000425bbb	cmpl	$0xc0000002, %ebx               ## imm = 0xC0000002
0000000000425bc1	cmovgel	%ebx, %esi
0000000000425bc4	cmpl	$0x3ffffffe, %r15d              ## imm = 0x3FFFFFFE
0000000000425bcb	movl	$0x3ffffffe, %ecx               ## imm = 0x3FFFFFFE
0000000000425bd0	movl	$0x3ffffffe, %r14d              ## imm = 0x3FFFFFFE
0000000000425bd6	cmovll	%r15d, %r14d
0000000000425bda	shrq	$0x20, %r15
0000000000425bde	cmpl	$0x3ffffffe, %r15d              ## imm = 0x3FFFFFFE
0000000000425be5	cmovll	%r15d, %ecx
0000000000425be9	subl	%edi, %r14d
0000000000425bec	subl	%esi, %ecx
0000000000425bee	testl	%r13d, %r13d
0000000000425bf1	movl	-0x34(%rbp), %r8d
0000000000425bf5	js	0x425c52
0000000000425bf7	testl	%r8d, %r8d
0000000000425bfa	js	0x425c52
0000000000425bfc	movl	%r13d, %edx
0000000000425bff	testl	%r14d, %r14d
0000000000425c02	js	0x425c46
0000000000425c04	testl	%ecx, %ecx
0000000000425c06	js	0x425c46
0000000000425c08	movl	-0x2c(%rbp), %r13d
0000000000425c0c	cmpl	%edi, %r13d
0000000000425c0f	movl	%edi, %eax
0000000000425c11	cmovll	%r13d, %eax
0000000000425c15	addl	%r13d, %edx
0000000000425c18	addl	%edi, %r14d
0000000000425c1b	cmpl	%r14d, %edx
0000000000425c1e	cmovgl	%edx, %r14d
0000000000425c22	movl	-0x30(%rbp), %r13d
0000000000425c26	cmpl	%esi, %r13d
0000000000425c29	movl	%esi, %edx
0000000000425c2b	cmovll	%r13d, %edx
0000000000425c2f	addl	%r13d, %r8d
0000000000425c32	addl	%esi, %ecx
0000000000425c34	cmpl	%ecx, %r8d
0000000000425c37	cmovgl	%r8d, %ecx
0000000000425c3b	subl	%eax, %r14d
0000000000425c3e	subl	%edx, %ecx
0000000000425c40	movl	%edx, %esi
0000000000425c42	movl	%eax, %edi
0000000000425c44	jmp	0x425c52
0000000000425c46	movl	%r8d, %ecx
0000000000425c49	movl	%edx, %r14d
0000000000425c4c	movl	-0x30(%rbp), %esi
0000000000425c4f	movl	-0x2c(%rbp), %edi
0000000000425c52	addl	%edi, %r14d
0000000000425c55	addl	%esi, %ecx
0000000000425c57	movl	%r14d, %edx
0000000000425c5a	addq	$0x18, %rsp
0000000000425c5e	popq	%rbx
0000000000425c5f	popq	%r12
0000000000425c61	popq	%r13
0000000000425c63	popq	%r14
0000000000425c65	popq	%r15
0000000000425c67	popq	%rbp
0000000000425c68	jmp	0x6dcca8                        ## symbol stub for: _HGRectMake4i
0000000000425c6d	nopl	(%rax)
