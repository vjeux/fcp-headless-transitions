__ZN27FFDestDominantMotionPrivate17NextDecodedFieldsEiPPvS1_S0_:
0000000001360db0	pushq	%rbp
0000000001360db1	movq	%rsp, %rbp
0000000001360db4	pushq	%r15
0000000001360db6	pushq	%r14
0000000001360db8	pushq	%r12
0000000001360dba	pushq	%rbx
0000000001360dbb	movq	%rcx, %rbx
0000000001360dbe	movq	%rdx, %r14
0000000001360dc1	movq	%rsi, %r15
0000000001360dc4	movq	0x58c5d5(%rip), %rdi            ## literal pool symbol address: _OBJC_CLASS_$_NSAutoreleasePool
0000000001360dcb	callq	0x1497908                       ## symbol stub for: _objc_alloc_init
0000000001360dd0	movq	%rax, %r12
0000000001360dd3	movq	0x8a0b3e(%rip), %rsi
0000000001360dda	movq	%rbx, %rdi
0000000001360ddd	movq	%r15, %rdx
0000000001360de0	movq	%r14, %rcx
0000000001360de3	xorl	%r8d, %r8d
0000000001360de6	xorl	%r9d, %r9d
0000000001360de9	callq	*0x58c8d1(%rip)                 ## Objc message: -[%rdi arranged]
0000000001360def	movl	%eax, %ebx
0000000001360df1	movq	%r12, %rdi
0000000001360df4	callq	*0x58c90e(%rip)                 ## literal pool symbol address: _objc_release
0000000001360dfa	movl	%ebx, %eax
0000000001360dfc	popq	%rbx
0000000001360dfd	popq	%r12
0000000001360dff	popq	%r14
0000000001360e01	popq	%r15
0000000001360e03	popq	%rbp
0000000001360e04	retq
0000000001360e05	nopw	%cs:(%rax,%rax)
