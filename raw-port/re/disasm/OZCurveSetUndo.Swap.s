__ZN14OZCurveSetUndo4SwapEv:
0000000000101ac0	pushq	%rbp
0000000000101ac1	movq	%rsp, %rbp
0000000000101ac4	pushq	%r15
0000000000101ac6	pushq	%r14
0000000000101ac8	pushq	%r13
0000000000101aca	pushq	%r12
0000000000101acc	pushq	%rbx
0000000000101acd	pushq	%rax
0000000000101ace	movq	%rdi, %rbx
0000000000101ad1	leaq	_theApp(%rip), %rax
0000000000101ad8	movq	(%rax), %rdi
0000000000101adb	callq	__ZN13OZApplication13getCurrentDocEv ## OZApplication::getCurrentDoc()
0000000000101ae0	testq	%rax, %rax
0000000000101ae3	je	0x101b95
0000000000101ae9	movq	%rax, %r14
0000000000101aec	movq	0xa0(%rax), %rdi
0000000000101af3	testq	%rdi, %rdi
0000000000101af6	je	0x101b95
0000000000101afc	movq	0x8084ed(%rip), %rsi
0000000000101b03	movq	0x72451e(%rip), %r13            ## Objc message: -[%rdi getCurrentTool]
0000000000101b0a	callq	*%r13
0000000000101b0d	movq	0x80785c(%rip), %rsi
0000000000101b14	movq	%rax, %rdi
0000000000101b17	callq	*%r13
0000000000101b1a	movq	0x807867(%rip), %rsi
0000000000101b21	movq	%rax, %rdi
0000000000101b24	callq	*%r13
0000000000101b27	movq	0x80851a(%rip), %rsi
0000000000101b2e	movq	%rax, %rdi
0000000000101b31	callq	*%r13
0000000000101b34	testq	%rax, %rax
0000000000101b37	je	0x101b95
0000000000101b39	movq	%rax, %r15
0000000000101b3c	movl	0x14(%rbx), %eax
0000000000101b3f	testl	%eax, %eax
0000000000101b41	je	0x101bff
0000000000101b47	cmpl	$0x1, %eax
0000000000101b4a	je	0x101ba4
0000000000101b4c	cmpl	$0x2, %eax
0000000000101b4f	jne	0x101c7f
0000000000101b55	movq	0x8(%rbx), %rdx
0000000000101b59	movq	0x8084f0(%rip), %rsi
0000000000101b60	movq	%r15, %rdi
0000000000101b63	callq	*%r13
0000000000101b66	movq	0x8(%rbx), %rdx
0000000000101b6a	movq	0x8084e7(%rip), %rsi
0000000000101b71	movq	%r15, %rdi
0000000000101b74	callq	*%r13
0000000000101b77	movq	0x8(%rbx), %rdi
0000000000101b7b	callq	*0x7244ef(%rip)                 ## literal pool symbol address: _objc_release
0000000000101b81	movq	$0x0, 0x8(%rbx)
0000000000101b89	movl	$0x1, 0x14(%rbx)
0000000000101b90	jmp	0x101c7f
0000000000101b95	addq	$0x8, %rsp
0000000000101b99	popq	%rbx
0000000000101b9a	popq	%r12
0000000000101b9c	popq	%r13
0000000000101b9e	popq	%r14
0000000000101ba0	popq	%r15
0000000000101ba2	popq	%rbp
0000000000101ba3	retq
0000000000101ba4	movl	0x10(%rbx), %edx
0000000000101ba7	movq	0x8084b2(%rip), %rsi
0000000000101bae	movq	%r15, %rdi
0000000000101bb1	callq	*0x724471(%rip)                 ## Objc message: -[%rdi getCurrentTool]
0000000000101bb7	testq	%rax, %rax
0000000000101bba	je	0x101bf3
0000000000101bbc	movq	%rax, %r12
0000000000101bbf	movq	0x8(%rbx), %rdi
0000000000101bc3	callq	*0x7244a7(%rip)                 ## literal pool symbol address: _objc_release
0000000000101bc9	movq	%r12, %rdi
0000000000101bcc	callq	*0x7244a6(%rip)                 ## literal pool symbol address: _objc_retain
0000000000101bd2	movq	%rax, 0x8(%rbx)
0000000000101bd6	movq	0x80848b(%rip), %rsi
0000000000101bdd	movq	%r15, %rdi
0000000000101be0	movq	%r12, %rdx
0000000000101be3	callq	*%r13
0000000000101be6	movq	0x808483(%rip), %rsi
0000000000101bed	movq	%r15, %rdi
0000000000101bf0	callq	*%r13
0000000000101bf3	movl	$0x2, 0x14(%rbx)
0000000000101bfa	jmp	0x101c7f
0000000000101bff	movl	0x10(%rbx), %edx
0000000000101c02	movq	0x808457(%rip), %rsi
0000000000101c09	movq	%r15, %rdi
0000000000101c0c	callq	*0x724416(%rip)                 ## Objc message: -[%rdi getCurrentTool]
0000000000101c12	testq	%rax, %rax
0000000000101c15	je	0x101c7f
0000000000101c17	movq	0x808412(%rip), %rsi
0000000000101c1e	movq	%rax, %rdi
0000000000101c21	movq	%rax, %r12
0000000000101c24	callq	*%r13
0000000000101c27	movq	%rax, -0x30(%rbp)
0000000000101c2b	movl	0x10(%rbx), %edx
0000000000101c2e	movq	0x80840b(%rip), %rsi
0000000000101c35	movq	%rax, %rdi
0000000000101c38	callq	*%r13
0000000000101c3b	movq	0x808426(%rip), %rsi
0000000000101c42	movq	%r15, %rdi
0000000000101c45	movq	%r12, %rdx
0000000000101c48	callq	*%r13
0000000000101c4b	movq	0x8(%rbx), %rdx
0000000000101c4f	movq	0x8083fa(%rip), %rsi
0000000000101c56	movq	%r15, %rdi
0000000000101c59	callq	*%r13
0000000000101c5c	movq	0x8(%rbx), %rdx
0000000000101c60	movq	0x8083f1(%rip), %rsi
0000000000101c67	movq	%r15, %rdi
0000000000101c6a	callq	*%r13
0000000000101c6d	movq	0x8(%rbx), %rdi
0000000000101c71	callq	*0x7243f9(%rip)                 ## literal pool symbol address: _objc_release
0000000000101c77	movq	-0x30(%rbp), %rax
0000000000101c7b	movq	%rax, 0x8(%rbx)
0000000000101c7f	movq	%r14, %rdi
0000000000101c82	movl	$0x20020, %esi                  ## imm = 0x20020
0000000000101c87	addq	$0x8, %rsp
0000000000101c8b	popq	%rbx
0000000000101c8c	popq	%r12
0000000000101c8e	popq	%r13
0000000000101c90	popq	%r14
0000000000101c92	popq	%r15
0000000000101c94	popq	%rbp
0000000000101c95	jmp	__ZN10OZDocument16postNotificationEj ## OZDocument::postNotification(unsigned int)
0000000000101c9a	nopw	(%rax,%rax)
