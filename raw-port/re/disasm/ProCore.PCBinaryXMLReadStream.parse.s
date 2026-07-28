__ZN21PCBinaryXMLReadStream5parseEv:
0000000000064852	pushq	%rbp
0000000000064853	movq	%rsp, %rbp
0000000000064856	pushq	%r15
0000000000064858	pushq	%r14
000000000006485a	pushq	%rbx
000000000006485b	subq	$0x38, %rsp
000000000006485f	movq	%rdi, %rbx
0000000000064862	movq	0xe39b7(%rip), %rax             ## literal pool symbol address: ___stack_chk_guard
0000000000064869	movq	(%rax), %rax
000000000006486c	movq	%rax, -0x20(%rbp)
0000000000064870	xorl	%r15d, %r15d
0000000000064873	movq	0x98(%rbx), %rdi
000000000006487a	leaq	(%r15,%rbp), %r14
000000000006487e	addq	$-0x40, %r14
0000000000064882	movq	(%rdi), %rax
0000000000064885	movl	$0x1, %edx
000000000006488a	movq	%r14, %rsi
000000000006488d	callq	*0x10(%rax)
0000000000064890	cmpb	$0x0, (%r14)
0000000000064894	je	0x648a0
0000000000064896	cmpq	$0x1f, %r15
000000000006489a	leaq	0x1(%r15), %r15
000000000006489e	jne	0x64873
00000000000648a0	movl	$0x4d425a4f, %eax               ## imm = 0x4D425A4F
00000000000648a5	xorl	-0x40(%rbp), %eax
00000000000648a8	movzbl	-0x3c(%rbp), %ecx
00000000000648ac	xorl	$0x4c, %ecx
00000000000648af	orl	%eax, %ecx
00000000000648b1	je	0x648d0
00000000000648b3	xorl	%eax, %eax
00000000000648b5	movq	0xe3964(%rip), %rcx             ## literal pool symbol address: ___stack_chk_guard
00000000000648bc	movq	(%rcx), %rcx
00000000000648bf	cmpq	-0x20(%rbp), %rcx
00000000000648c3	jne	0x64926
00000000000648c5	addq	$0x38, %rsp
00000000000648c9	popq	%rbx
00000000000648ca	popq	%r14
00000000000648cc	popq	%r15
00000000000648ce	popq	%rbp
00000000000648cf	retq
00000000000648d0	leaq	0xce554(%rip), %rsi             ## literal pool for: "OZBML %d.%d"
00000000000648d7	leaq	-0x40(%rbp), %rdi
00000000000648db	leaq	-0x48(%rbp), %r14
00000000000648df	leaq	-0x44(%rbp), %r15
00000000000648e3	movq	%r14, %rdx
00000000000648e6	movq	%r15, %rcx
00000000000648e9	xorl	%eax, %eax
00000000000648eb	callq	0xdeb40                         ## symbol stub for: _sscanf
00000000000648f0	movl	(%r14), %eax
00000000000648f3	movl	%eax, 0x68(%rbx)
00000000000648f6	movl	(%r15), %eax
00000000000648f9	movl	%eax, 0x6c(%rbx)
00000000000648fc	movq	%rbx, %rdi
00000000000648ff	callq	__ZN21PCBinaryXMLReadStream12parseElementEv ## PCBinaryXMLReadStream::parseElement()
0000000000064904	cmpl	$-0x1, %eax
0000000000064907	je	0x648b3
0000000000064909	cmpb	$0x0, 0xb1(%rbx)
0000000000064910	jne	0x648b3
0000000000064912	movl	%eax, %ecx
0000000000064914	movb	$0x1, %al
0000000000064916	cmpl	$0x1, %ecx
0000000000064919	jne	0x648b5
000000000006491b	cmpb	$0x0, 0xb0(%rbx)
0000000000064922	je	0x648fc
0000000000064924	jmp	0x648b5
0000000000064926	callq	0xde744                         ## symbol stub for: ___stack_chk_fail
000000000006492b	nop
