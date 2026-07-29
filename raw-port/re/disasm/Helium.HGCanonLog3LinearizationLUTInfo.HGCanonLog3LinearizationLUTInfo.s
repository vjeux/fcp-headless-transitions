
/tmp/Helium.x86_64:	file format mach-o 64-bit x86-64

Disassembly of section __TEXT,__text:

0000000000113de0 <__ZN31HGCanonLog3LinearizationLUTInfoC2EmffN16HGApplyNDLUTInfo16LUTStorageFormatE>:
  113de0: 55                           	pushq	%rbp
  113de1: 48 89 e5                     	movq	%rsp, %rbp
  113de4: 53                           	pushq	%rbx
  113de5: 50                           	pushq	%rax
  113de6: 89 d1                        	movl	%edx, %ecx
  113de8: 48 89 fb                     	movq	%rdi, %rbx
  113deb: ba 01 00 00 00               	movl	$0x1, %edx
  113df0: e8 eb 97 f2 ff               	callq	0x3d5e0 <__ZN16HGApplyNDLUTInfoC2EmmffNS_16LUTStorageFormatE>
  113df5: 48 8d 05 ec 8e 90 00         	leaq	0x908eec(%rip), %rax    ## 0xa1cce8 <__ZTV31HGCanonLog3LinearizationLUTInfo+0x10>
  113dfc: 48 89 03                     	movq	%rax, (%rbx)
  113dff: 48 83 c4 08                  	addq	$0x8, %rsp
  113e03: 5b                           	popq	%rbx
  113e04: 5d                           	popq	%rbp
  113e05: c3                           	retq
  113e06: 66 2e 0f 1f 84 00 00 00 00 00	nopw	%cs:(%rax,%rax)
