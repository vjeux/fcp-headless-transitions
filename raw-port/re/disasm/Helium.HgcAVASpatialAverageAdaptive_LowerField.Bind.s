__ZN39HgcAVASpatialAverageAdaptive_LowerField4BindEP9HGHandler:
000000000021da10	pushq	%rbp
000000000021da11	movq	%rsp, %rbp
000000000021da14	pushq	%r14
000000000021da16	pushq	%rbx
000000000021da17	movq	%rsi, %rbx
000000000021da1a	movq	%rdi, %r14
000000000021da1d	movq	%rsi, %rdi
000000000021da20	xorl	%esi, %esi
000000000021da22	xorl	%edx, %edx
000000000021da24	xorl	%ecx, %ecx
000000000021da26	xorl	%r8d, %r8d
000000000021da29	callq	__ZN9HGHandler8TexCoordEiiiPKd  ## HGHandler::TexCoord(int, int, int, double const*)
000000000021da2e	movq	0x198(%r14), %rdx
000000000021da35	movq	(%rbx), %rax
000000000021da38	movq	%rbx, %rdi
000000000021da3b	xorl	%esi, %esi
000000000021da3d	movl	$0x1, %ecx
000000000021da42	callq	*0x90(%rax)
000000000021da48	movq	(%r14), %rax
000000000021da4b	movq	%r14, %rdi
000000000021da4e	movq	%rbx, %rsi
000000000021da51	callq	*0xc0(%rax)
000000000021da57	xorl	%eax, %eax
000000000021da59	popq	%rbx
000000000021da5a	popq	%r14
000000000021da5c	popq	%rbp
000000000021da5d	retq
000000000021da5e	nop
