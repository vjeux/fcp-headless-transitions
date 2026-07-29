__ZN10PCDelaunay8Triangle4bondEPS0_ii:
00000000000547c4	pushq	%rbp
00000000000547c5	movq	%rsp, %rbp
00000000000547c8	movslq	%edx, %rax
00000000000547cb	movq	%rax, %rdx
00000000000547ce	shlq	$0x4, %rdx
00000000000547d2	movq	%rsi, 0x18(%rdi,%rdx)
00000000000547d7	movl	%ecx, 0x20(%rdi,%rdx)
00000000000547db	movslq	%ecx, %rcx
00000000000547de	shlq	$0x4, %rcx
00000000000547e2	movq	%rdi, 0x18(%rsi,%rcx)
00000000000547e7	movl	%eax, 0x20(%rsi,%rcx)
00000000000547eb	popq	%rbp
00000000000547ec	retq
00000000000547ed	nop
