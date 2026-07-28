__ZNK7OZScene18getRawWorkingGamutEv:
0000000000081da0	pushq	%rbp
0000000000081da1	movq	%rsp, %rbp
0000000000081da4	pushq	%r14
0000000000081da6	pushq	%rbx
0000000000081da7	movq	%rdi, %rbx
0000000000081daa	leaq	0x28(%rdi), %r14
0000000000081dae	movq	%r14, %rdi
0000000000081db1	callq	0x6ddafa                        ## symbol stub for: __ZN13PCSharedMutex11lock_sharedEv
0000000000081db6	movl	0xc8(%rbx), %ebx
0000000000081dbc	movq	%r14, %rdi
0000000000081dbf	callq	0x6ddb00                        ## symbol stub for: __ZN13PCSharedMutex13unlock_sharedEv
0000000000081dc4	movl	%ebx, %eax
0000000000081dc6	popq	%rbx
0000000000081dc7	popq	%r14
0000000000081dc9	popq	%rbp
0000000000081dca	retq
0000000000081dcb	movq	%rax, %rdi
0000000000081dce	callq	___clang_call_terminate
0000000000081dd3	nopw	%cs:(%rax,%rax)
