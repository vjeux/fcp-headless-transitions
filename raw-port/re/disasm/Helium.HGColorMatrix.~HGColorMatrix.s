__ZN13HGColorMatrixD0Ev:
0000000000246cd0	pushq	%rbp
0000000000246cd1	movq	%rsp, %rbp
0000000000246cd4	pushq	%rbx
0000000000246cd5	pushq	%rax
0000000000246cd6	movq	%rdi, %rbx
0000000000246cd9	leaq	0x7ef950(%rip), %rax
0000000000246ce0	movq	%rax, (%rdi)
0000000000246ce3	movq	0x198(%rdi), %rdi
0000000000246cea	testq	%rdi, %rdi
0000000000246ced	je	0x246cf5
0000000000246cef	movq	(%rdi), %rax
0000000000246cf2	callq	*0x18(%rax)
0000000000246cf5	movq	0x1a0(%rbx), %rax
0000000000246cfc	testq	%rax, %rax
0000000000246cff	je	0x246d0f
0000000000246d01	movq	-0x8(%rax), %rdi
0000000000246d05	testq	%rdi, %rdi
0000000000246d08	je	0x246d0f
0000000000246d0a	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000246d0f	movq	%rbx, %rdi
0000000000246d12	callq	__ZN8HGNode3DD2Ev               ## HGNode3D::~HGNode3D()
0000000000246d17	movq	%rbx, %rdi
0000000000246d1a	addq	$0x8, %rsp
0000000000246d1e	popq	%rbx
0000000000246d1f	popq	%rbp
0000000000246d20	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000246d25	movq	%rax, %rdi
0000000000246d28	callq	___clang_call_terminate
0000000000246d2d	nopl	(%rax)
