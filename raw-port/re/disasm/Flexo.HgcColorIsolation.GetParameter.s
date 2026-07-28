__ZN17HgcColorIsolation12GetParameterEiPf:
000000000145e6f0	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
000000000145e6f5	cmpl	$0x8, %esi
000000000145e6f8	ja	0x145e738
000000000145e6fa	pushq	%rbp
000000000145e6fb	movq	%rsp, %rbp
000000000145e6fe	movq	0x198(%rdi), %rax
000000000145e705	movl	%esi, %ecx
000000000145e707	shlq	$0x5, %rcx
000000000145e70b	movss	(%rax,%rcx), %xmm0
000000000145e710	movss	%xmm0, (%rdx)
000000000145e714	movss	0x4(%rax,%rcx), %xmm0
000000000145e71a	movss	%xmm0, 0x4(%rdx)
000000000145e71f	movss	0x8(%rax,%rcx), %xmm0
000000000145e725	movss	%xmm0, 0x8(%rdx)
000000000145e72a	movss	0xc(%rax,%rcx), %xmm0
000000000145e730	movss	%xmm0, 0xc(%rdx)
000000000145e735	xorl	%eax, %eax
000000000145e737	popq	%rbp
000000000145e738	retq
000000000145e739	nopl	(%rax)
