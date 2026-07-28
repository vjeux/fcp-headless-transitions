__ZN7OZScene18setRawWorkingGamutE19PCWorkingGamutValue:
0000000000081de0	pushq	%rbp
0000000000081de1	movq	%rsp, %rbp
0000000000081de4	pushq	%r15
0000000000081de6	pushq	%r14
0000000000081de8	pushq	%rbx
0000000000081de9	pushq	%rax
0000000000081dea	movl	%esi, %r14d
0000000000081ded	movq	%rdi, %r15
0000000000081df0	leaq	0x28(%rdi), %rbx
0000000000081df4	movq	%rbx, %rdi
0000000000081df7	callq	0x6ddb06                        ## symbol stub for: __ZN13PCSharedMutex4lockEv
0000000000081dfc	addq	$0x90, %r15
0000000000081e03	movq	%r15, %rdi
0000000000081e06	movl	%r14d, %esi
0000000000081e09	callq	__ZN15OZSceneSettings18setRawWorkingGamutE19PCWorkingGamutValue ## OZSceneSettings::setRawWorkingGamut(PCWorkingGamutValue)
0000000000081e0e	movq	%rbx, %rdi
0000000000081e11	callq	0x6ddb0c                        ## symbol stub for: __ZN13PCSharedMutex6unlockEv
0000000000081e16	addq	$0x8, %rsp
0000000000081e1a	popq	%rbx
0000000000081e1b	popq	%r14
0000000000081e1d	popq	%r15
0000000000081e1f	popq	%rbp
0000000000081e20	retq
0000000000081e21	movq	%rax, %rdi
0000000000081e24	callq	___clang_call_terminate
0000000000081e29	movq	%rax, %r14
0000000000081e2c	movq	%rbx, %rdi
0000000000081e2f	callq	0x6ddb0c                        ## symbol stub for: __ZN13PCSharedMutex6unlockEv
0000000000081e34	movq	%r14, %rdi
0000000000081e37	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
0000000000081e3c	movq	%rax, %rdi
0000000000081e3f	callq	___clang_call_terminate
0000000000081e44	nopw	%cs:(%rax,%rax)
