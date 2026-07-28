__ZN15NoPaddingPolicyC2Ev:
0000000000044d00	pushq	%rbp
0000000000044d01	movq	%rsp, %rbp
0000000000044d04	pushq	%rbx
0000000000044d05	pushq	%rax
0000000000044d06	movq	%rdi, %rbx
0000000000044d09	callq	__ZN8HGObjectC2Ev               ## HGObject::HGObject()
0000000000044d0e	leaq	0x9c2993(%rip), %rax
0000000000044d15	movq	%rax, (%rbx)
0000000000044d18	addq	$0x8, %rsp
0000000000044d1c	popq	%rbx
0000000000044d1d	popq	%rbp
0000000000044d1e	retq
0000000000044d1f	nop
__ZN15NoPaddingPolicyC1Ev:
0000000000044d20	pushq	%rbp
0000000000044d21	movq	%rsp, %rbp
0000000000044d24	pushq	%rbx
0000000000044d25	pushq	%rax
0000000000044d26	movq	%rdi, %rbx
0000000000044d29	callq	__ZN8HGObjectC2Ev               ## HGObject::HGObject()
0000000000044d2e	leaq	0x9c2973(%rip), %rax
0000000000044d35	movq	%rax, (%rbx)
0000000000044d38	addq	$0x8, %rsp
0000000000044d3c	popq	%rbx
0000000000044d3d	popq	%rbp
0000000000044d3e	retq
0000000000044d3f	nop
__ZN15NoPaddingPolicyD2Ev:
0000000000044d40	pushq	%rbp
0000000000044d41	movq	%rsp, %rbp
0000000000044d44	popq	%rbp
0000000000044d45	jmp	__ZN8HGObjectD2Ev               ## HGObject::~HGObject()
0000000000044d4a	nopw	(%rax,%rax)
__ZN15NoPaddingPolicyD1Ev:
0000000000044d50	pushq	%rbp
0000000000044d51	movq	%rsp, %rbp
0000000000044d54	popq	%rbp
0000000000044d55	jmp	__ZN8HGObjectD2Ev               ## HGObject::~HGObject()
0000000000044d5a	nopw	(%rax,%rax)
__ZN15NoPaddingPolicyD0Ev:
0000000000044d60	pushq	%rbp
0000000000044d61	movq	%rsp, %rbp
0000000000044d64	pushq	%rbx
0000000000044d65	pushq	%rax
0000000000044d66	movq	%rdi, %rbx
0000000000044d69	callq	__ZN8HGObjectD2Ev               ## HGObject::~HGObject()
0000000000044d6e	movq	%rbx, %rdi
0000000000044d71	addq	$0x8, %rsp
0000000000044d75	popq	%rbx
0000000000044d76	popq	%rbp
0000000000044d77	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000044d7c	nopl	(%rax)
__ZN15NoPaddingPolicy10adjustRectE6HGRect:
