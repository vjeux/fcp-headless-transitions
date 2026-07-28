__ZN20HGCRetimeVariableRezD0Ev:
0000000000194380	pushq	%rbp
0000000000194381	movq	%rsp, %rbp
0000000000194384	pushq	%rbx
0000000000194385	pushq	%rax
0000000000194386	movq	%rdi, %rbx
0000000000194389	callq	__ZN20HgcRetimeVariableRezD2Ev  ## HgcRetimeVariableRez::~HgcRetimeVariableRez()
000000000019438e	movq	%rbx, %rdi
0000000000194391	addq	$0x8, %rsp
0000000000194395	popq	%rbx
0000000000194396	popq	%rbp
0000000000194397	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
000000000019439c	nopl	(%rax)
