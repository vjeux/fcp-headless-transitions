__ZN17OZStringTablesMapC2Ev:
0000000000063cc2	pushq	%rbp
0000000000063cc3	movq	%rsp, %rbp
0000000000063cc6	pushq	%r14
0000000000063cc8	pushq	%rbx
0000000000063cc9	movq	%rdi, %rbx
0000000000063ccc	movl	$0x32, %esi
0000000000063cd1	callq	0xacb46                         ## symbol stub for: __ZN11PCSingletonC2Ej
0000000000063cd6	leaq	__ZTV17OZStringTablesMap(%rip), %rax ## vtable for OZStringTablesMap
0000000000063cdd	addq	$0x10, %rax
0000000000063ce1	movq	%rax, (%rbx)
0000000000063ce4	leaq	0x8(%rbx), %rdi
0000000000063ce8	callq	0xacb94                         ## symbol stub for: __ZN13PCSharedMutexC1Ev
0000000000063ced	leaq	0x78(%rbx), %rax
0000000000063cf1	xorps	%xmm0, %xmm0
0000000000063cf4	movups	%xmm0, 0x78(%rbx)
0000000000063cf8	movq	%rax, 0x70(%rbx)
0000000000063cfc	popq	%rbx
0000000000063cfd	popq	%r14
0000000000063cff	popq	%rbp
0000000000063d00	retq
0000000000063d01	movq	%rax, %r14
0000000000063d04	movq	%rbx, %rdi
0000000000063d07	callq	0xacb4c                         ## symbol stub for: __ZN11PCSingletonD2Ev
0000000000063d0c	movq	%r14, %rdi
0000000000063d0f	callq	0xacaf2                         ## symbol stub for: __Unwind_Resume
