__ZN15XMLtoFactoryIDs12parseElementER22PCSerializerReadStreamR15PCStreamElement:
000000000033cf10	pushq	%rbp
000000000033cf11	movq	%rsp, %rbp
000000000033cf14	pushq	%r15
000000000033cf16	pushq	%r14
000000000033cf18	pushq	%rbx
000000000033cf19	pushq	%rax
000000000033cf1a	movl	$0x0, -0x1c(%rbp)
000000000033cf21	movl	0x8(%rdx), %eax
000000000033cf24	cmpl	$0x3b, %eax
000000000033cf27	jg	0x33cf5b
000000000033cf29	cmpl	$0x14, %eax
000000000033cf2c	je	0x33cff8
000000000033cf32	cmpl	$0x17, %eax
000000000033cf35	je	0x33cffe
000000000033cf3b	cmpl	$0x1d, %eax
000000000033cf3e	jne	0x33d010
000000000033cf44	addq	$0x8, %rdi
000000000033cf48	movq	%rdi, %rax
000000000033cf4b	movq	%rsi, %rdi
000000000033cf4e	movq	%rax, %rsi
000000000033cf51	callq	0x6de790                        ## symbol stub for: __ZN22PCSerializerReadStream11pushHandlerEP12PCSerializer
000000000033cf56	jmp	0x33d028
000000000033cf5b	leal	-0x5a(%rax), %ecx
000000000033cf5e	cmpl	$0x2, %ecx
000000000033cf61	jb	0x33cfeb
000000000033cf67	cmpl	$0x3c, %eax
000000000033cf6a	je	0x33d01b
000000000033cf70	cmpl	$0x5c, %eax
000000000033cf73	jne	0x33d010
000000000033cf79	leaq	-0x1c(%rbp), %rcx
000000000033cf7d	movq	%rsi, %rdi
000000000033cf80	movq	%rsi, %rbx
000000000033cf83	movq	%rdx, %rsi
000000000033cf86	movq	%rdx, %r14
000000000033cf89	movl	$0x6f, %edx
000000000033cf8e	callq	0x6df798                        ## symbol stub for: __ZNK22PCSerializerReadStream20getAttributeAsUInt32ERK15PCStreamElementjPj
000000000033cf93	movq	%rbx, %r15
000000000033cf96	movq	%rbx, %rdi
000000000033cf99	movq	%r14, %rsi
000000000033cf9c	movl	$0x75, %edx
000000000033cfa1	callq	0x6df780                        ## symbol stub for: __ZNK22PCSerializerReadStream18getAttributeAsUUIDERK15PCStreamElementj
000000000033cfa6	testq	%rax, %rax
000000000033cfa9	je	0x33cfe3
000000000033cfab	movq	%rax, %rbx
000000000033cfae	leaq	_theApp(%rip), %r14
000000000033cfb5	movq	(%r14), %rax
000000000033cfb8	movq	0x20(%rax), %rdi
000000000033cfbc	movq	%rbx, %rsi
000000000033cfbf	callq	0x6dd5ae                        ## symbol stub for: __ZN11OZFactories11findFactoryERK6PCUUID
000000000033cfc4	testq	%rax, %rax
000000000033cfc7	je	0x33cfdb
000000000033cfc9	movq	(%r14), %rcx
000000000033cfcc	movl	-0x1c(%rbp), %esi
000000000033cfcf	movq	0x20(%rcx), %rdi
000000000033cfd3	movq	%rax, %rdx
000000000033cfd6	callq	0x6dd5c6                        ## symbol stub for: __ZN11OZFactories16setFactoryLoadIDEjP9OZFactory
000000000033cfdb	movq	%rbx, %rdi
000000000033cfde	callq	0x6dfc36                        ## symbol stub for: __ZdlPv
000000000033cfe3	movq	%r15, %rdi
000000000033cfe6	movq	(%r15), %rax
000000000033cfe9	jmp	0x33d016
000000000033cfeb	movq	%rsi, %rdi
000000000033cfee	movq	%rdx, %rsi
000000000033cff1	callq	__ZL12checkVersionR22PCSerializerReadStreamR15PCStreamElement ## checkVersion(PCSerializerReadStream&, PCStreamElement&)
000000000033cff6	jmp	0x33d028
000000000033cff8	addq	$0x30, %rdi
000000000033cffc	jmp	0x33d002
000000000033cffe	addq	$0x38, %rdi
000000000033d002	movq	(%rdx), %rax
000000000033d005	movq	%rdi, %rsi
000000000033d008	movq	%rdx, %rdi
000000000033d00b	callq	*0x10(%rax)
000000000033d00e	jmp	0x33d028
000000000033d010	movq	(%rsi), %rax
000000000033d013	movq	%rsi, %rdi
000000000033d016	callq	*0x28(%rax)
000000000033d019	jmp	0x33d028
000000000033d01b	movb	$0x1, 0x40(%rdi)
000000000033d01f	movq	(%rsi), %rax
000000000033d022	movq	%rsi, %rdi
000000000033d025	callq	*0x20(%rax)
000000000033d028	movb	$0x1, %al
000000000033d02a	addq	$0x8, %rsp
000000000033d02e	popq	%rbx
000000000033d02f	popq	%r14
000000000033d031	popq	%r15
000000000033d033	popq	%rbp
000000000033d034	retq
000000000033d035	nopw	%cs:(%rax,%rax)
