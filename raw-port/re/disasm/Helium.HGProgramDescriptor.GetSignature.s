__ZNK19HGProgramDescriptor12GetSignatureEv:
000000000016d660	pushq	%rbp
000000000016d661	movq	%rsp, %rbp
000000000016d664	pushq	%rbx
000000000016d665	pushq	%rax
000000000016d666	movq	%rdi, %rbx
000000000016d669	xorps	%xmm0, %xmm0
000000000016d66c	movups	%xmm0, 0x20(%rdi)
000000000016d670	movups	%xmm0, 0x14(%rdi)
000000000016d674	movups	%xmm0, 0x4(%rdi)
000000000016d678	movl	$0x60b10, (%rdi)                ## imm = 0x60B10
000000000016d67e	movb	$0x1, 0x2a(%rdi)
000000000016d682	movq	%rsi, %rdi
000000000016d685	movq	%rbx, %rsi
000000000016d688	callq	__ZNK19HGProgramDescriptor19privateGetSignatureER8HGLimits ## HGProgramDescriptor::privateGetSignature(HGLimits&) const
000000000016d68d	movq	%rbx, %rax
000000000016d690	addq	$0x8, %rsp
000000000016d694	popq	%rbx
000000000016d695	popq	%rbp
000000000016d696	retq
000000000016d697	nopw	(%rax,%rax)
