__ZN19OZChannelRotation3D14willBeModifiedEj:
000000000008203c	pushq	%rbp
000000000008203d	movq	%rsp, %rbp
0000000000082040	pushq	%r14
0000000000082042	pushq	%rbx
0000000000082043	movl	%esi, %ebx
0000000000082045	movq	%rdi, %r14
0000000000082048	callq	__ZN13OZChannelBase14willBeModifiedEj ## OZChannelBase::willBeModified(unsigned int)
000000000008204d	movq	(%r14), %rax
0000000000082050	movq	0x328(%rax), %rax
0000000000082057	movq	%r14, %rdi
000000000008205a	movl	%ebx, %esi
000000000008205c	popq	%rbx
000000000008205d	popq	%r14
000000000008205f	popq	%rbp
0000000000082060	jmpq	*%rax
