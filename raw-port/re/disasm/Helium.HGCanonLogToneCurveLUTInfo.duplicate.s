__ZNK26HGCanonLogToneCurveLUTInfo9duplicateEv:
0000000000115770	pushq	%rbp
0000000000115771	movq	%rsp, %rbp
0000000000115774	pushq	%rbx
0000000000115775	pushq	%rax
0000000000115776	movq	%rdi, %rbx
0000000000115779	movl	$0x28, %edi
000000000011577e	callq	0x3c4fb2                        ## symbol stub for: __Znwm
0000000000115783	movups	0x8(%rbx), %xmm0
0000000000115787	movups	0x14(%rbx), %xmm1
000000000011578b	movups	%xmm0, 0x8(%rax)
000000000011578f	movups	%xmm1, 0x14(%rax)
0000000000115793	leaq	0x90745e(%rip), %rcx
000000000011579a	movq	%rcx, (%rax)
000000000011579d	addq	$0x8, %rsp
00000000001157a1	popq	%rbx
00000000001157a2	popq	%rbp
00000000001157a3	retq
00000000001157a4	nopw	%cs:(%rax,%rax)
