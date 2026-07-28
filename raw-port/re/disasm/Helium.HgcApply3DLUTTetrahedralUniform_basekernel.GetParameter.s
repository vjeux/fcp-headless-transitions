__ZN42HgcApply3DLUTTetrahedralUniform_basekernel12GetParameterEiPf:
000000000039ae50	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
000000000039ae55	cmpl	$0x2, %esi
000000000039ae58	ja	0x39ae98
000000000039ae5a	pushq	%rbp
000000000039ae5b	movq	%rsp, %rbp
000000000039ae5e	movq	0x198(%rdi), %rax
000000000039ae65	movl	%esi, %ecx
000000000039ae67	shlq	$0x5, %rcx
000000000039ae6b	movss	(%rax,%rcx), %xmm0
000000000039ae70	movss	%xmm0, (%rdx)
000000000039ae74	movss	0x4(%rax,%rcx), %xmm0
000000000039ae7a	movss	%xmm0, 0x4(%rdx)
000000000039ae7f	movss	0x8(%rax,%rcx), %xmm0
000000000039ae85	movss	%xmm0, 0x8(%rdx)
000000000039ae8a	movss	0xc(%rax,%rcx), %xmm0
000000000039ae90	movss	%xmm0, 0xc(%rdx)
000000000039ae95	xorl	%eax, %eax
000000000039ae97	popq	%rbp
000000000039ae98	retq
000000000039ae99	nopl	(%rax)
