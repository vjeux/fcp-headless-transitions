__ZN20FFAudioSignalClamper10PostRenderEjRK14AudioTimeStampjjRK15AudioBufferList:
0000000000d02e70	cmpl	$0x0, (%r9)
0000000000d02e74	je	0xd02f3f
0000000000d02e7a	pushq	%rbp
0000000000d02e7b	movq	%rsp, %rbp
0000000000d02e7e	pushq	%r15
0000000000d02e80	pushq	%r14
0000000000d02e82	pushq	%r12
0000000000d02e84	pushq	%rbx
0000000000d02e85	movq	%r9, %rbx
0000000000d02e88	movl	%r8d, %r14d
0000000000d02e8b	leaq	0x8(%r9), %r15
0000000000d02e8f	xorl	%r12d, %r12d
0000000000d02e92	movaps	0x869f17(%rip), %xmm1
0000000000d02e99	movss	0x86baa3(%rip), %xmm2
0000000000d02ea1	movss	0x878797(%rip), %xmm3
0000000000d02ea9	jmp	0xd02ed6
0000000000d02eab	nopl	(%rax,%rax)
0000000000d02eb0	callq	0x1497584                       ## symbol stub for: _bzero
0000000000d02eb5	movss	0x878783(%rip), %xmm3
0000000000d02ebd	movss	0x86ba7f(%rip), %xmm2
0000000000d02ec5	movaps	0x869ee4(%rip), %xmm1
0000000000d02ecc	incq	%r12
0000000000d02ecf	movl	(%rbx), %eax
0000000000d02ed1	cmpq	%rax, %r12
0000000000d02ed4	jae	0xd02f37
0000000000d02ed6	movq	%r12, %rax
0000000000d02ed9	shlq	$0x4, %rax
0000000000d02edd	movq	0x8(%r15,%rax), %rdi
0000000000d02ee2	testq	%rdi, %rdi
0000000000d02ee5	je	0xd02ecc
0000000000d02ee7	addq	%r15, %rax
0000000000d02eea	movl	(%rax), %ecx
0000000000d02eec	imull	%r14d, %ecx
0000000000d02ef0	leal	(,%rcx,4), %edx
0000000000d02ef7	movl	0x4(%rax), %esi
0000000000d02efa	movl	%esi, %eax
0000000000d02efc	shrl	$0x2, %eax
0000000000d02eff	cmpl	%edx, %esi
0000000000d02f01	cmovael	%ecx, %eax
0000000000d02f04	testl	%eax, %eax
0000000000d02f06	je	0xd02ecc
0000000000d02f08	movl	%eax, %eax
0000000000d02f0a	xorl	%ecx, %ecx
0000000000d02f0c	jmp	0xd02f17
0000000000d02f0e	nop
0000000000d02f10	incq	%rcx
0000000000d02f13	cmpl	%ecx, %eax
0000000000d02f15	je	0xd02ecc
0000000000d02f17	movss	(%rdi,%rcx,4), %xmm0
0000000000d02f1c	ucomiss	%xmm0, %xmm0
0000000000d02f1f	jp	0xd02eb0
0000000000d02f21	andps	%xmm1, %xmm0
0000000000d02f24	ucomiss	%xmm2, %xmm0
0000000000d02f27	jbe	0xd02f10
0000000000d02f29	ucomiss	%xmm3, %xmm0
0000000000d02f2c	ja	0xd02eb0
0000000000d02f2e	movl	$0x41000000, (%rdi,%rcx,4)      ## imm = 0x41000000
0000000000d02f35	jmp	0xd02f10
0000000000d02f37	popq	%rbx
0000000000d02f38	popq	%r12
0000000000d02f3a	popq	%r14
0000000000d02f3c	popq	%r15
0000000000d02f3e	popq	%rbp
0000000000d02f3f	retq
