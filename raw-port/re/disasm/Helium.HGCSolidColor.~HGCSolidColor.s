__ZN13HGCSolidColorD0Ev:
000000000011b710	pushq	%rbp
000000000011b711	movq	%rsp, %rbp
000000000011b714	pushq	%rbx
000000000011b715	pushq	%rax
000000000011b716	movq	%rdi, %rbx
000000000011b719	callq	__ZN13HgcSolidColorD2Ev         ## HgcSolidColor::~HgcSolidColor()
000000000011b71e	movq	%rbx, %rdi
000000000011b721	addq	$0x8, %rsp
000000000011b725	popq	%rbx
000000000011b726	popq	%rbp
000000000011b727	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
000000000011b72c	nopl	(%rax)
